import 'dotenv/config'
import express from 'express'
import { generateItinerary } from './generateItinerary.mjs'
import { moodProfiles } from './moodProfiles.mjs'
import { saveGeneratedPlan } from './planStore.mjs'
import { saveRating, getSavedRating } from './ratings.mjs'
import { createShareLink, getSharedPlan } from './sharing.mjs'

const app = express()
const port = 3001

app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (request, response) => {
  response.json({
    status: 'ok',
    message: 'MoodTrip backend is running!',
  })
})

app.post('/api/itinerary', async (request, response) => {
  const { destination, days, budget, mood } = request.body ?? {}

  const validInput =
    typeof destination === 'string' &&
    destination.trim().length > 0 &&
    destination.trim().length <= 80 &&
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
      error: 'Please enter a destination, 1–7 days, a valid budget, and a mood.',
    })
  }

  try {
    const plan = await generateItinerary({
      destination: destination.trim(),
      days,
      budget,
      mood,
    })

    const savedPlan = await saveGeneratedPlan(plan)
    return response.json(savedPlan)
  } catch (error) {
    console.log('Itinerary generation or saving failed:', error.message)

    return response.status(502).json({
      error: error.message || 'Could not generate and save your itinerary.',
    })
  }
})

app.post('/api/ratings', async (request, response) => {
  const { itineraryId, feedbackToken, rating } = request.body ?? {}

  try {
    const result = await saveRating({ itineraryId, feedbackToken, rating })
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

app.listen(port, '127.0.0.1', () => {
  console.log(`MoodTrip backend: http://localhost:${port}`)
})
