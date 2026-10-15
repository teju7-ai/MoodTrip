import 'dotenv/config'
import express from 'express'
import { generateItinerary } from './generateItinerary.mjs'
import { moodProfiles } from './moodProfiles.mjs'
import { saveGeneratedPlan } from './planStore.mjs'
import { saveRating, getSavedRating } from './ratings.mjs'
import { createShareLink, getSharedPlan } from './sharing.mjs'
import { searchDestinationSuggestions } from './places.mjs'

const app = express()
app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', message: 'MoodTrip backend is running!' })
})

app.get('/api/destinations', async (request, response) => {
  const query = typeof request.query.q === 'string' ? request.query.q.trim() : ''

  if (!query || query.length > 80) {
    return response.status(400).json({
      error: 'Enter between 1 and 80 characters to search destinations.',
    })
  }

  try {
    const suggestions = await searchDestinationSuggestions(query)
    return response.json({ suggestions })
  } catch (error) {
    console.log('Destination search failed:', error.message)
    return response.status(502).json({
      error: error.message || 'Could not search destinations.',
    })
  }
})

app.post('/api/itinerary', async (request, response) => {
  const { destination, destinationSelection, days, budget, mood } = request.body ?? {}
  const selectedCoordinates = destinationSelection ?? {}
  const validSelection =
    destinationSelection &&
    typeof destinationSelection.label === 'string' &&
    Number.isFinite(Number(selectedCoordinates.latitude)) &&
    Number.isFinite(Number(selectedCoordinates.longitude))

  const validInput =
    typeof destination === 'string' &&
    destination.trim().length > 0 &&
    destination.trim().length <= 80 &&
    validSelection &&
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
      error: 'Choose a destination suggestion, then enter valid trip details.',
    })
  }

  try {
    const plan = await generateItinerary({
      destination: destination.trim(),
      destinationSelection,
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
  const { itineraryId, feedbackToken, rating, comment } = request.body ?? {}
  try {
    return response.json(await saveRating({ itineraryId, feedbackToken, rating, comment }))
  } catch (error) {
    console.log('Rating request failed:', error.message)
    return response.status(error.status ?? 500).json({ error: error.message || 'Could not save your rating.' })
  }
})

app.post('/api/ratings/read', async (request, response) => {
  const { itineraryId, feedbackToken } = request.body ?? {}
  try {
    return response.json(await getSavedRating({ itineraryId, feedbackToken }))
  } catch (error) {
    console.log('Rating lookup failed:', error.message)
    return response.status(error.status ?? 500).json({ error: error.message || 'Could not load your rating.' })
  }
})

app.post('/api/share', async (request, response) => {
  const { itineraryId, feedbackToken } = request.body ?? {}
  response.set('Cache-Control', 'no-store')
  try {
    return response.json(await createShareLink({ itineraryId, feedbackToken }))
  } catch (error) {
    console.log('Share link request failed:', error.message)
    return response.status(error.status ?? 500).json({ error: error.message || 'Could not create a share link.' })
  }
})

app.get('/api/shared/:shareToken', async (request, response) => {
  response.set('Cache-Control', 'no-store')
  try {
    return response.json(await getSharedPlan(request.params.shareToken))
  } catch (error) {
    console.log('Shared plan request failed:', error.message)
    return response.status(error.status ?? 500).json({ error: error.message || 'Could not load the shared itinerary.' })
  }
})

app.use('/api', (request, response) => response.status(404).json({ error: 'This API endpoint does not exist.' }))
app.use((error, request, response, next) => {
  if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'The request contains invalid JSON.' })
  if (error.type === 'entity.too.large') return response.status(413).json({ error: 'The request is too large.' })
  return response.status(500).json({ error: 'Something went wrong on the server.' })
})

export default app
