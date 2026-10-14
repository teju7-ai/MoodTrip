import { randomUUID } from 'node:crypto'
import { supabase } from './supabase.mjs'
import { verifyPlanAccess } from './ratings.mjs'

function createError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

export async function createShareLink({
  itineraryId,
  feedbackToken,
}) {
  await verifyPlanAccess(itineraryId, feedbackToken)

  // Create a sharing code only if this plan does not already have one.
  const { data: created, error: updateError } = await supabase
    .from('itineraries')
    .update({
      share_token: randomUUID(),
    })
    .eq('id', itineraryId)
    .is('share_token', null)
    .select('share_token')
    .maybeSingle()

  if (updateError) {
    console.log('Sharing failed. Database code:', updateError.code)
    throw createError('Could not create a share link. Please try again.', 503)
  }

  if (created?.share_token) {
    return {
      shareToken: created.share_token,
    }
  }

  // Reuse the existing link instead of changing it.
  const { data: existing, error: readError } = await supabase
    .from('itineraries')
    .select('share_token')
    .eq('id', itineraryId)
    .maybeSingle()

  if (readError || !existing?.share_token) {
    throw createError('Could not read the share link. Please try again.', 503)
  }

  return {
    shareToken: existing.share_token,
  }
}

export async function getSharedPlan(shareToken) {
  const validToken =
    typeof shareToken === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(shareToken)

  if (!validToken) {
    throw createError('This share link is invalid.', 400)
  }

  const { data, error } = await supabase
    .from('itineraries')
    .select('plan')
    .eq('share_token', shareToken)
    .maybeSingle()

  if (error) {
    console.log('Shared plan lookup failed. Database code:', error.code)
    throw createError('Could not load the shared plan. Please try again.', 503)
  }

  if (!data) {
    throw createError('This shared plan could not be found.', 404)
  }

  // Return itinerary content only, never the creator's rating code.
  const {
    feedbackToken: ignoredToken,
    ...publicPlan
  } = data.plan

  return {
    plan: {
      ...publicPlan,
      isShared: true,
    },
  }
}