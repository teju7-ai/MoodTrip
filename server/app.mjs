import 'dotenv/config'
import express from 'express'
import { generateItinerary } from './generateItinerary.mjs'
import { moodProfiles } from './moodProfiles.mjs'
import { saveGeneratedPlan } from './planStore.mjs'
import { saveRating, getSavedRating } from './ratings.mjs'
import { createShareLink, getSharedPlan } from './sharing.mjs'
import { suggestDestinations } from './places.mjs'
import { readDestination } from './destinationSelection.mjs'

const app = express()

app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (request, response) => {
  response.json({
    status: 'ok',
    message: 'MoodTrip backend is running!',
  })
})

app.get('/api/destinations', async (request, response) => {
  response.set('Cache-Control', 'no-store')
  try {
    return response.json({ suggestions: await suggestDestinations(request.query.q) })
  } catch (error) {
    return response.status(error.status ?? 502).json({ error: error.status === 400 ? error.message : 'Destination search is unavailable. Please try again.' })
  }
})

app.post('/api/itinerary', async (request, response) => {
  const { destination, destinationToken, days, budget, mood } = request.body ?? {}

  const validInput =
    typeof destination === 'string' &&
    destination.trim().length > 0 &&
    destination.trim().length <= 80 &&
    typeof destinationToken === 'string' &&
    destinationToken.length > 0 &&
    Number.isInteger(days) &&
    days >= 1 &&
    days <= 7 &&
    Number.isFinite(budget) &&
    budget >= 1000 &&
    budget <= 50000 &&
    typeof mood === 'string' &&
    Object.hasOwn(moodProfiles, mood)

  if (!validInput) {
    return response.status(400).json({
      error: 'Please choose a destination suggestion, 1–7 days, a valid budget, and a mood.',
    })
  }

  try {
    readDestination(destinationToken)
    const plan = await generateItinerary({
      destination: destination.trim(),
      destinationToken,
      days,
      budget,
      mood,
    })

    const savedPlan = await saveGeneratedPlan(plan)
    return response.json(savedPlan)
  } catch (error) {
    console.log('Itinerary generation or saving failed:', error.message)

    return response.status(error.status ?? 502).json({
      error: error.message || 'Could not generate and save your itinerary.',
    })
  }
})

app.post('/api/ratings', async (request, response) => {
  const { itineraryId, feedbackToken, rating, comment } = request.body ?? {}

  try {
    const result = await saveRating({ itineraryId, feedbackToken, rating, comment })
    return response.json(result)
  } catch (error) {
    console.log('Rating request failed:', error.message)

    return response.status(error.status ?? 500).json({
      error: error.message || 'Could not save your rating.',
    })
  }
})

app.post('/api/ratings/read', async (request, response) => {
  const { itineraryId, feedbackToken } = request.body ?? {}

  try {
    const result = await getSavedRating({ itineraryId, feedbackToken })
    return response.json(result)
  } catch (error) {
    console.log('Rating lookup failed:', error.message)

    return response.status(error.status ?? 500).json({
      error: error.message || 'Could not load your rating.',
    })
  }
})

app.post('/api/share', async (request, response) => {
  const { itineraryId, feedbackToken } = request.body ?? {}
  response.set('Cache-Control', 'no-store')

  try {
    const result = await createShareLink({ itineraryId, feedbackToken })
    return response.json(result)
  } catch (error) {
    console.log('Share link request failed:', error.message)

    return response.status(error.status ?? 500).json({
      error: error.message || 'Could not create a share link.',
    })
  }
})

app.get('/api/shared/:shareToken', async (request, response) => {
  response.set('Cache-Control', 'no-store')

  try {
    const result = await getSharedPlan(request.params.shareToken)
    return response.json(result)
  } catch (error) {
    console.log('Shared plan request failed:', error.message)

    return response.status(error.status ?? 500).json({
      error: error.message || 'Could not load the shared itinerary.',
    })
  }
})

app.use('/api', (request, response) => {
  return response.status(404).json({ error: 'This API endpoint does not exist.' })
})

app.use((error, request, response, next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({
      error: 'The request contains invalid JSON.',
    })
  }

  if (error.type === 'entity.too.large') {
    return response.status(413).json({
      error: 'The request is too large.',
    })
  }

  return response.status(500).json({
    error: 'Something went wrong on the server.',
  })
})

export default app
