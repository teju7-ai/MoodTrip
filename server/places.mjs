import 'dotenv/config'
import { signDestination, readDestination } from './destinationSelection.mjs'
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

export async function suggestDestinations(query) {
  if (typeof query !== 'string' || query.trim().length < 2 || query.trim().length > 80) {
    throw Object.assign(new Error('Enter between 2 and 80 characters to search destinations.'), { status: 400 })
  }
  // The autocomplete endpoint applies an implicit proximity bias based on the
  // server region. On Vercel in the US, "Taj Mahal" therefore returned nearby
  // businesses before the landmark in Agra. Forward search ranks globally.
  const data = await requestGeoapify('/v1/geocode/search', {
    text: query.trim(), format: 'json', limit: '6', lang: 'en',
  })
  const seen = new Set()
  return (data.results ?? []).filter((place) => {
    if (!place.formatted || !Number.isFinite(place.lat) || Math.abs(place.lat) > 90 ||
        !Number.isFinite(place.lon) || Math.abs(place.lon) > 180) return false
    const key = `${place.formatted}:${place.lat}:${place.lon}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 6).map((place) => ({
    name: (place.name || place.address_line1 || place.formatted).slice(0, 80),
    label: place.formatted,
    type: place.result_type || 'place',
    token: signDestination({
      name: place.formatted, latitude: place.lat, longitude: place.lon,
      country: place.country ?? '', countryCode: place.country_code ?? '',
    }),
  }))
}

export async function findDestination(destination) {
  const data = await requestGeoapify('/v1/geocode/search', {
    text: destination,
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

  // A locality-only search excludes landmarks and can match just one word
  // (for example, "Mahal" instead of the Taj Mahal). Do not plan around
  // a weak match even when the provider labels it a "full_match".
  if (!Number.isFinite(location.rank?.confidence) || location.rank.confidence < 0.8) {
    throw new Error(
      'Destination match is uncertain. Add the city, state, or country (for example, Taj Mahal, Agra, India).',
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

export async function getCandidatePlaces({ destination, mood, destinationToken }) {
  const cleanedDestination =
    typeof destination === 'string' ? destination.trim() : ''

  if (
    !cleanedDestination ||
    cleanedDestination.length > 80
  ) {
    throw new Error('Enter a destination between 1 and 80 characters.')
  }

  const profile = getMoodProfile(mood)
  const location = destinationToken !== undefined
    ? readDestination(destinationToken)
    : await findDestination(cleanedDestination)

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
