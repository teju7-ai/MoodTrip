export async function requestItinerary(trip, signal) {
  let response

  try {
    response = await fetch('/api/itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: trip.destination,
        days: trip.days,
        budget: trip.budget,
        mood: trip.mood,
      }),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new Error(
      'Could not reach the backend. Check that both server windows are running.',
    )
  }

  let data

  try {
    data = await response.json()
  } catch {
    throw new Error(
      'The server returned an unreadable response. Check both server windows.',
    )
  }

  if (!response.ok) {
    throw new Error(
      data.error || 'Could not generate your itinerary. Please try again.',
    )
  }

  if (
    !data.id ||
    !Array.isArray(data.itinerary) ||
    data.itinerary.length !== trip.days
  ) {
    throw new Error('The server returned an incomplete itinerary.')
  }

  return data
}

async function sendRatingRequest(path, body, signal) {
  let response

  try {
    response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new Error(
      'Could not reach the backend. Check that both servers are running.',
    )
  }

  let data

  try {
    data = await response.json()
  } catch {
    throw new Error('The server returned an unreadable rating response.')
  }

  if (!response.ok) {
    throw new Error(data.error || 'The rating request failed.')
  }

  return data
}

export async function saveItineraryRating(plan, rating, signal) {
  return sendRatingRequest(
    '/api/ratings',
    {
      itineraryId: plan.id,
      feedbackToken: plan.feedbackToken,
      rating,
    },
    signal,
  )
}

export async function loadItineraryRating(plan, signal) {
  return sendRatingRequest(
    '/api/ratings/read',
    {
      itineraryId: plan.id,
      feedbackToken: plan.feedbackToken,
    },
    signal,
  )
}

export async function createItineraryShareLink(plan, signal) {
  const result = await sendRatingRequest(
    '/api/share',
    {
      itineraryId: plan.id,
      feedbackToken: plan.feedbackToken,
    },
    signal,
  )

  const validToken =
    typeof result.shareToken === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(result.shareToken)

  if (!validToken) {
    throw new Error('The server returned an invalid share link.')
  }

  return new URL(
    `/shared/${result.shareToken}`,
    window.location.origin,
  ).href
}