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
  const [rating, setRating] = useState(0)
  const [savedRating, setSavedRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const saveControllerRef = useRef(null)
  const canRate = !plan.isDemo && Boolean(plan.feedbackToken)

  useEffect(() => {
    const controller = new AbortController()

    setRating(0)
    setSavedRating(null)
    setError('')
    setLoading(canRate)

    if (canRate) {
      loadItineraryRating(plan, controller.signal)
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
  }, [plan.id, plan.feedbackToken, canRate])

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
      )

      if (controller.signal.aborted) return

      if (result.rating !== rating) {
        throw new Error('The server did not confirm your selected rating.')
      }

      setSavedRating(result.rating)
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

  const hasChanges = rating > 0 && rating !== savedRating

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
                  ? 'Update rating'
                  : 'Save rating'}
            </button>

            <p
              role="status"
              aria-live="polite"
              className="mt-4 min-h-6 text-sm font-bold"
            >
              {loading
                ? 'Loading your rating…'
                : saving
                  ? 'Saving your rating…'
                  : savedRating !== null && !hasChanges
                    ? `Your ${savedRating}/5 rating is saved.`
                    : rating > 0
                      ? `Selected ${rating}/5. Save to confirm.`
                      : 'Choose your stars, then save your rating.'}
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