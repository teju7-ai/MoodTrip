import { createHash, randomBytes } from 'node:crypto'
import { supabase } from './supabase.mjs'

export function hashFeedbackToken(token) {
  return createHash('sha256')
    .update(token)
    .digest('hex')
}

export async function saveGeneratedPlan(plan) {
  // Each itinerary gets a private code for submitting its rating.
  const feedbackToken = randomBytes(32).toString('hex')

  // Never include the private code in the stored itinerary content.
  const {
    feedbackToken: ignoredToken,
    ...storedPlan
  } = plan

  const { error } = await supabase
    .from('itineraries')
    .insert({
      id: storedPlan.id,
      destination: storedPlan.destination,
      mood: storedPlan.mood,
      plan: storedPlan,
      feedback_token_hash: hashFeedbackToken(feedbackToken),
    })

  if (error) {
    console.log('Itinerary save failed. Database code:', error.code)

    throw new Error(
      'The itinerary could not be saved. Please try again.',
    )
  }

  // Return the private code to the creator's browser.
  // Only its hash is stored in the database.
  return {
    ...storedPlan,
    feedbackToken,
  }
}