import 'dotenv/config'
import {
  getMoodProfile,
  getMoodScore,
  mealCategories,
} from './moodProfiles.mjs'

// Search within 15 km of the destination's resolved center.
const SEARCH_RADIUS = 15000
const MAX_DESTINATION_QUERY_LENGTH = 80

async function requestGeoapify(path, parameters) {
  const apiKey = process.env.GEOAPIFY_API_KEY

  if (!apiKey) {
    throw new Error('Geoapify key missing. Check your .env file.')
  }

  const url = new URL(path, 'https://api.geoapify.com')
  url.search = new URLSearchParams({ ...parameters, apiKey }).toString()

  let response
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(30000) })
  } catch {
    throw new Error('Could not reach Geoapify. Please try again.')
  }

  if (!response.ok) {
    throw new Error(`Geoapify request failed: ${response.status}`)
  }

  return response.json()
}

function normalizeLocation(result, fallback = '') {
  if (!result || !Number.isFinite(result.lat) || !Number.isFinite(result.lon)) {
    return null
  }

  return {
    id: typeof result.place_id === 'string' ? result.place_id : null,
    name: typeof result.formatted === 'string' && result.formatted.trim()
      ? result.formatted.trim()
      : fallback,
    latitude: result.lat,
    longitude: result.lon,
    country: result.country ?? '',
    countryCode: result.country_code ?? '',
    resultType: result.result_type ?? result.type ?? '',
  }
}

export async function searchDestinationSuggestions(query) {
  const text = typeof query === 'string' ? query.trim() : ''

  if (!text || text.length > MAX_DESTINATION_QUERY_LENGTH) {
    return []
  }

  const data = await requestGeoapify('/v1/geocode/search', {
    text,
    format: 'json',
    limit: '6',
    lang: 'en',
  })

  return (Array.isArray(data.results) ? data.results : [])
    .map((result) => {
      const location = normalizeLocation(result, text)
      if (!location) return null

      return {
        ...location,
        label: location.name,
        name: result.name ?? result.street ?? location.name,
      }
    })
    .filter(Boolean)
}

function validateSelectedDestination(selection) {
  if (!selection || typeof selection !== 'object') return null

  const name = typeof selection.label === 'string'
    ? selection.label.trim()
    : ''
  const latitude = Number(selection.latitude)
  const longitude = Number(selection.longitude)

  if (
    !name ||
    name.length > MAX_DESTINATION_QUERY_LENGTH ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  return {
    id: typeof selection.id === 'string' ? selection.id : null,
    name,
    latitude,
    longitude,
    country: typeof selection.country === 'string' ? selection.country : '',
    countryCode:
      typeof selection.countryCode === 'string'
        ? selection.countryCode
        : '',
    resultType:
      typeof selection.resultType === 'string'
        ? selection.resultType
        : '',
  }
}

async function findDestination(destination) {
  const suggestions = await searchDestinationSuggestions(destination)
  const location = suggestions[0]

  if (!location) {
    throw new Error(
      'Destination not found. Choose a suggestion or add the city and country.',
    )
  }

  return location
}

async function searchNearby(location, categories, limit) {
  const data = await requestGeoapify('/v2/places', {
    categories: categories.join(','),
    filter: `circle:${location.longitude},${location.latitude},${SEARCH_RADIUS}`,
    bias: `proximity:${location.longitude},${location.latitude}`,
    limit: String(limit),
    lang: 'en',
  })

  return data.features ?? []
}

export async function getCandidatePlaces({
  destination,
  destinationSelection,
  mood,
}) {
  const cleanedDestination = typeof destination === 'string'
    ? destination.trim()
    : ''

  if (!cleanedDestination || cleanedDestination.length > MAX_DESTINATION_QUERY_LENGTH) {
    throw new Error('Enter a destination between 1 and 80 characters.')
  }

  const profile = getMoodProfile(mood)
  const location = destinationSelection
    ? validateSelectedDestination(destinationSelection)
    : await findDestination(cleanedDestination)

  if (!location) {
    throw new Error('Choose a valid destination suggestion before searching.')
  }

  const moodResults = await searchNearby(location, profile.categories, 60)
  const mealResults = await searchNearby(location, mealCategories, 30)
  const uniquePlaces = new Map()

  for (const feature of [...moodResults, ...mealResults]) {
    const properties = feature.properties ?? {}
    const name = properties.name?.trim()
    const latitude = properties.lat
    const longitude = properties.lon

    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue
    }

    const categories = Array.isArray(properties.categories)
      ? properties.categories
      : []
    const id = properties.place_id ?? `${name}:${latitude}:${longitude}`

    if (uniquePlaces.has(id)) continue

    uniquePlaces.set(id, {
      id,
      name,
      address: properties.formatted ?? '',
      latitude,
      longitude,
      categories,
      moodScore: getMoodScore(categories, mood),
      distanceMeters: Number.isFinite(properties.distance)
        ? properties.distance
        : null,
      source: 'Geoapify',
    })
  }

  const places = [...uniquePlaces.values()].sort(
    (first, second) =>
      second.moodScore - first.moodScore ||
      (first.distanceMeters ?? Infinity) - (second.distanceMeters ?? Infinity),
  )

  if (places.length === 0) {
    throw new Error(
      'No named places found nearby. Try a nearby city or another mood.',
    )
  }

  return {
    location,
    mood: profile.label,
    pace: profile.pace,
    searchRadiusMeters: SEARCH_RADIUS,
    places,
  }
}
