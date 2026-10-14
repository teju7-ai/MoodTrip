import { supabase } from './supabase.mjs'

// Start each place with three neutral ratings.
// This prevents one review from dominating the ranking.
const PRIOR_COUNT = 3
const NEUTRAL_RATING = 3
const BOOST_SCALE = 5

export function rankPlacesWithFeedback(places, feedbackRows) {
  const stats = new Map()

  for (const row of feedbackRows) {
    if (
      !Number.isInteger(row.rating) ||
      row.rating < 1 ||
      row.rating > 5
    ) {
      continue
    }

    const itinerary = Array.isArray(row.itineraries)
      ? row.itineraries[0]
      : row.itineraries

    const days = itinerary?.plan?.itinerary

    if (!Array.isArray(days)) continue

    // Count each place once per rated itinerary.
    const placeIds = new Set()

    for (const day of days) {
      if (!Array.isArray(day.stops)) continue

      for (const stop of day.stops) {
        if (typeof stop.placeId === 'string') {
          placeIds.add(stop.placeId)
        }
      }
    }

    for (const placeId of placeIds) {
      const current = stats.get(placeId) ?? {
        total: 0,
        count: 0,
      }

      current.total += row.rating
      current.count += 1

      stats.set(placeId, current)
    }
  }

  return places
    .map((place) => {
      const feedback = stats.get(place.id)
      const count = feedback?.count ?? 0
      const total = feedback?.total ?? 0

      const smoothedRating =
        (total + PRIOR_COUNT * NEUTRAL_RATING) /
        (count + PRIOR_COUNT)

      const feedbackBoost =
        (smoothedRating - NEUTRAL_RATING) * BOOST_SCALE

      return {
        ...place,
        feedbackCount: count,
        feedbackBoost: Number(feedbackBoost.toFixed(2)),
        rankingScore: Number(
          (place.moodScore + feedbackBoost).toFixed(2),
        ),
      }
    })
    .sort(
      (first, second) =>
        second.rankingScore - first.rankingScore ||
        (first.distanceMeters ?? Infinity) -
          (second.distanceMeters ?? Infinity),
    )
}

export async function getFeedbackRanking(places, mood) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        rating,
        updated_at,
        itineraries!inner (
          mood,
          plan
        )
      `)
      .eq('itineraries.mood', mood)
      .order('updated_at', { ascending: false })
      .limit(200)
      .abortSignal(AbortSignal.timeout(8000))

    if (error) {
      console.log('Feedback lookup unavailable. Database code:', error.code)

      return {
        places: rankPlacesWithFeedback(places, []),
        feedbackAvailable: false,
        ratedItineraries: 0,
      }
    }

    const rows = data ?? []

    return {
      places: rankPlacesWithFeedback(places, rows),
      feedbackAvailable: true,
      ratedItineraries: rows.length,
    }
  } catch {
    // A feedback lookup failure should not prevent trip generation.
    return {
      places: rankPlacesWithFeedback(places, []),
      feedbackAvailable: false,
      ratedItineraries: 0,
    }
  }
}