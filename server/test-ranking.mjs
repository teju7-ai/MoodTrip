import { supabase } from './supabase.mjs'
import { getFeedbackRanking } from './feedbackRanking.mjs'

try {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      rating,
      itineraries!inner (
        mood,
        plan
      )
    `)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Could not read feedback. Database code: ${error.code}`)
  }

  if (!data) {
    throw new Error('Save a rating on your website first.')
  }

  const itinerary = Array.isArray(data.itineraries)
    ? data.itineraries[0]
    : data.itineraries

  const stop = itinerary?.plan?.itinerary
    ?.flatMap((day) => day.stops ?? [])
    .find((item) => item.placeId)

  if (!stop) {
    throw new Error('The rated itinerary has no usable place IDs.')
  }

  const candidates = [
    {
      id: stop.placeId,
      name: stop.name,
      moodScore: 30,
      distanceMeters: 0,
    },
    {
      id: 'comparison-place-with-no-feedback',
      name: 'Unrated comparison place',
      moodScore: 30,
      distanceMeters: 0,
    },
  ]

  const result = await getFeedbackRanking(
    candidates,
    itinerary.mood,
  )

  if (!result.feedbackAvailable) {
    throw new Error('Feedback lookup failed. Check the database connection.')
  }

  console.log('Feedback ranking connected!')
  console.log('Mood:', itinerary.mood)
  console.log('Latest itinerary rating:', data.rating)
  console.log('Rated itineraries considered:', result.ratedItineraries)

  for (const place of result.places) {
    console.log(`\n${place.name}`)
    console.log('Original mood score:', place.moodScore)
    console.log('Feedback count:', place.feedbackCount)
    console.log('Feedback adjustment:', place.feedbackBoost)
    console.log('Final ranking score:', place.rankingScore)
  }
} catch (error) {
  console.log('Ranking test failed:', error.message)
  process.exitCode = 1
}