import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion as Motion,
  MotionConfig,
} from 'framer-motion'
import { Star } from 'lucide-react'
import {
  loadItineraryRating,
  saveItineraryRating,
} from './api.js'

export default function Rating({ plan }) {
  return <RatingForm key={`${plan.id}:${plan.feedbackToken ?? ''}:${Boolean(plan.isDemo)}`} plan={plan} />
}

function RatingForm({ plan }) {
  const { id, feedbackToken } = plan
  const canRate = !plan.isDemo && Boolean(feedbackToken)
  const [rating, setRating] = useState(0)
  const [savedRating, setSavedRating] = useState(null)
  const [comment, setComment] = useState('')
  const [savedComment, setSavedComment] = useState('')
  const [loading, setLoading] = useState(canRate)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const saveControllerRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    if (canRate) {
      loadItineraryRating({ id, feedbackToken }, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return

          const storedRating = result.rating

          if (
            storedRating !== null &&
            (!Number.isInteger(storedRating) ||
              storedRating < 1 ||
              storedRating > 5)
          ) {
            throw new Error('The saved rating could not be read.')
          }

          setRating(storedRating ?? 0)
          setSavedRating(storedRating)
          setComment(result.comment ?? '')
          setSavedComment(result.comment ?? '')
        })
        .catch((requestError) => {
          if (!controller.signal.aborted) {
            setError(requestError.message)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        })
    }

    return () => {
      controller.abort()
      saveControllerRef.current?.abort()
      saveControllerRef.current = null
    }
  }, [id, feedbackToken, canRate])

  async function handleSave() {
    if (
      !canRate ||
      rating === 0 ||
      loading ||
      saveControllerRef.current
    ) {
      return
    }

    const controller = new AbortController()
    saveControllerRef.current = controller

    setSaving(true)
    setError('')

    try {
      const result = await saveItineraryRating(
        plan,
        rating,
        controller.signal,
        comment,
      )

      if (controller.signal.aborted) return

      if (result.rating !== rating || result.comment !== comment.trim()) {
        throw new Error('The server did not confirm your selected rating.')
      }

      setSavedRating(result.rating)
      setComment(result.comment)
      setSavedComment(result.comment)
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError.message)
      }
    } finally {
      if (saveControllerRef.current === controller) {
        saveControllerRef.current = null
      }

      if (!controller.signal.aborted) {
        setSaving(false)
      }
    }
  }

  const hasChanges = rating > 0 && (rating !== savedRating || comment.trim() !== savedComment)

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="mt-14 rounded-3xl border-2 border-ink
          bg-pink p-6 text-center md:p-10"
      >
        <h2 className="font-heading text-4xl uppercase md:text-5xl">
          Your kind of trip?
        </h2>

        <p className="mt-3">
          How well does this plan match your mood?
        </p>

        {canRate ? (
          <>
            <div
              role="group"
              aria-label="Rate the itinerary"
              className="mt-6 flex justify-center gap-2"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <Motion.button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} out of 5 stars`}
                  aria-pressed={rating === value}
                  disabled={loading || saving}
                  onClick={() => {
                    setRating(value)
                    setError('')
                  }}
                  whileHover={{ scale: 1.15, rotate: -8 }}
                  whileTap={{ scale: 0.9 }}
                  className="grid h-12 w-12 place-items-center
                    rounded-xl disabled:cursor-wait disabled:opacity-50"
                >
                  <Star
                    size={32}
                    strokeWidth={2}
                    fill={value <= rating ? '#171714' : 'none'}
                  />
                </Motion.button>
              ))}
            </div>

            <div className="mx-auto mt-6 max-w-xl text-left">
              <label htmlFor="written-feedback" className="block font-bold">
                Written feedback <span className="font-normal">(optional)</span>
              </label>
              <p id="feedback-help" className="mt-1 text-sm">
                What did you like, and what could be improved? Your comments are shared with the MoodTrip team, not on public trip links.
              </p>
              <textarea
                id="written-feedback"
                aria-describedby="feedback-help feedback-count"
                value={comment}
                onChange={(event) => { setComment(event.target.value); setError('') }}
                maxLength={1000}
                rows={4}
                disabled={loading || saving}
                placeholder="Tell us about the places, budget, or pace of your plan…"
                className="mt-3 w-full resize-y rounded-xl border-2 border-ink bg-paper p-4 text-ink focus:outline-2 focus:outline-offset-2 disabled:opacity-50"
              />
              <p id="feedback-count" className="mt-1 text-right text-sm">{comment.length}/1,000 characters</p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saving || !hasChanges}
              className="mt-6 rounded-full border-2 border-ink
                bg-ink px-6 py-3 font-bold text-paper
                disabled:cursor-default disabled:opacity-40"
            >
              {saving
                ? 'Saving…'
                : savedRating !== null
                  ? 'Update feedback'
                  : 'Save feedback'}
            </button>

            <p
              role="status"
              aria-live="polite"
              className="mt-4 min-h-6 text-sm font-bold"
            >
              {loading
                ? 'Loading your feedback…'
                : saving
                  ? 'Saving your feedback…'
                  : savedRating !== null && !hasChanges
                    ? `Your feedback and ${savedRating}/5 rating are saved.`
                    : rating > 0
                      ? `Selected ${rating}/5. Save to confirm.`
                      : 'Choose your stars, optionally add a comment, then save.'}
            </p>

            {error && (
              <p
                role="alert"
                className="mx-auto mt-4 max-w-md rounded-xl
                  border-2 border-ink bg-paper p-3 text-sm"
              >
                {error}
              </p>
            )}
          </>
        ) : (
          <p className="mt-6 text-sm">
            Create a new itinerary to save a rating.{' '}
            <Link
              to="/planner"
              className="font-bold underline underline-offset-4"
            >
              Plan my trip
            </Link>
          </p>
        )}
      </section>
    </MotionConfig>
  )
}
