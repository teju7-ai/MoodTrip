import { timingSafeEqual } from 'node:crypto'
import { supabase } from './supabase.mjs'
import { hashFeedbackToken } from './planStore.mjs'

function createError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

export async function verifyPlanAccess(itineraryId, feedbackToken) {
  const validId =
    typeof itineraryId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(itineraryId)

  const validToken =
    typeof feedbackToken === 'string' &&
    /^[0-9a-f]{64}$/i.test(feedbackToken)

  if (!validId || !validToken) {
    throw createError('Invalid rating request.', 400)
  }

  const { data, error } = await supabase
    .from('itineraries')
    .select('feedback_token_hash')
    .eq('id', itineraryId)
    .maybeSingle()

  if (error) {
    console.log('Rating access check failed. Database code:', error.code)
    throw createError('Could not check this itinerary. Please try again.', 503)
  }

  if (!data) {
    throw createError('You cannot rate this itinerary with this access code.', 403)
  }

  const expected = Buffer.from(data.feedback_token_hash, 'hex')
  const supplied = Buffer.from(hashFeedbackToken(feedbackToken), 'hex')

  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    throw createError('You cannot rate this itinerary with this access code.', 403)
  }
}

export async function saveRating({
  itineraryId,
  feedbackToken,
  rating,
  comment,
}) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError('Choose a rating between 1 and 5.', 400)
  }

  if (comment !== undefined && (typeof comment !== 'string' || comment.length > 1000)) {
    throw createError('Written feedback must be text of at most 1,000 characters.', 400)
  }

  await verifyPlanAccess(itineraryId, feedbackToken)

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      {
        itinerary_id: itineraryId,
        rating,
        ...(comment !== undefined ? { comment: comment.trim() } : {}),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'itinerary_id',
      },
    )
    .select('rating, comment')
    .single()

  if (error) {
    console.log('Rating save failed. Database code:', error.code)
    throw createError('Could not save your rating. Please try again.', 503)
  }

  return { rating: data.rating, comment: data.comment ?? '' }
}

export async function getSavedRating({
  itineraryId,
  feedbackToken,
}) {
  await verifyPlanAccess(itineraryId, feedbackToken)

  const { data, error } = await supabase
    .from('ratings')
    .select('rating, comment')
    .eq('itinerary_id', itineraryId)
    .maybeSingle()

  if (error) {
    console.log('Rating lookup failed. Database code:', error.code)
    throw createError('Could not load your rating. Please try again.', 503)
  }

  return {
    rating: data?.rating ?? null,
    comment: data?.comment ?? '',
  }
}

