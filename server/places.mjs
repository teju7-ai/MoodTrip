import 'dotenv/config'
import {
  getMoodProfile,
  getMoodScore,
  mealCategories,
} from './moodProfiles.mjs'

// Search within 15 km of the destination's resolved center.
// This is a nearby search, not a search of an entire state or country.
const SEARCH_RADIUS = 15000

async function requestGeoapify(path, parameters) {
  const apiKey = process.env.GEOAPIFY_API_KEY

  if (!apiKey) {
    throw new Error('Geoapify key missing. Check your .env file.')
  }

  const url = new URL(path, 'https://api.geoapify.com')

  url.search = new URLSearchParams({
    ...parameters,
    apiKey,
  }).toString()

  let response

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    })
  } catch {
    // Avoid printing request URLs because they contain the API key.
    throw new Error('Could not reach Geoapify. Please try again.')
  }

  if (!response.ok) {
    throw new Error(`Geoapify request failed: ${response.status}`)
  }

  return response.json()
}

async function findDestination(destination) {
  const data = await requestGeoapify('/v1/geocode/search', {
    text: destination,
    type: 'locality',
    format: 'json',
    limit: '1',
    lang: 'en',
  })

  const location = data.results?.[0]

  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lon)
  ) {
    throw new Error(
      'Destination not found. Try adding the state or country.',
    )
  }

  return {
    name: location.formatted ?? destination,
    latitude: location.lat,
    longitude: location.lon,
    country: location.country ?? '',
    countryCode: location.country_code ?? '',
  }
}

async function searchNearby(location, categories, limit) {
  const data = await requestGeoapify('/v2/places', {
    categories: categories.join(','),
    filter:
      `circle:${location.longitude},` +
      `${location.latitude},${SEARCH_RADIUS}`,
    bias:
      `proximity:${location.longitude},${location.latitude}`,
    limit: String(limit),
    lang: 'en',
  })

  return data.features ?? []
}

export async function getCandidatePlaces({ destination, mood }) {
  const cleanedDestination =
    typeof destination === 'string' ? destination.trim() : ''

  if (
    !cleanedDestination ||
    cleanedDestination.length > 80
  ) {
    throw new Error('Enter a destination between 1 and 80 characters.')
  }

  const profile = getMoodProfile(mood)
  const location = await findDestination(cleanedDestination)

  // Separate searches prevent meal options from crowding out attractions.
  const moodResults = await searchNearby(
    location,
    profile.categories,
    60,
  )

  const mealResults = await searchNearby(
    location,
    mealCategories,
    30,
  )

  const uniquePlaces = new Map()

  for (const feature of [...moodResults, ...mealResults]) {
    const properties = feature.properties ?? {}
    const name = properties.name?.trim()
    const latitude = properties.lat
    const longitude = properties.lon

    // Keep named places with usable coordinates.
    if (
      !name ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      continue
    }

    const categories = Array.isArray(properties.categories)
      ? properties.categories
      : []

    const id =
      properties.place_id ??
      `${name}:${latitude}:${longitude}`

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
      (first.distanceMeters ?? Infinity) -
        (second.distanceMeters ?? Infinity),
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