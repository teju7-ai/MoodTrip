import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  motion as Motion,
  useReducedMotion,
} from 'framer-motion'
import { Compass } from 'lucide-react'
import { ItineraryView } from './Itinerary.jsx'

export default function Shared() {
  const { shareToken } = useParams()
  const reduceMotion = useReducedMotion()

  const [result, setResult] = useState({
    token: null,
    plan: null,
    error: '',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadPlan() {
      try {
        const response = await fetch(
          `/api/shared/${encodeURIComponent(shareToken)}`,
          {
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(30000),
            ]),
            cache: 'no-store',
          },
        )

        let data

        try {
          data = await response.json()
        } catch {
          throw new Error(
            'Could not read the shared plan. Check that both servers are running.',
          )
        }

        if (!response.ok) {
          throw new Error(data.error || 'Could not open this share link.')
        }

        const plan = data.plan

        const validPlan =
          plan &&
          typeof plan.id === 'string' &&
          typeof plan.destination === 'string' &&
          Number.isInteger(plan.days) &&
          plan.days >= 1 &&
          plan.days <= 7 &&
          Array.isArray(plan.itinerary) &&
          plan.itinerary.length === plan.days &&
          plan.itinerary.every(
            (day) =>
              typeof day.title === 'string' &&
              Array.isArray(day.stops) &&
              day.stops.length === 3 &&
              day.stops.every(
                (stop) =>
                  typeof stop.name === 'string' &&
                  typeof stop.mapsQuery === 'string' &&
                  Number.isFinite(stop.estimatedCost),
              ),
          )

        if (!validPlan) {
          throw new Error('This shared itinerary is incomplete.')
        }

        if (controller.signal.aborted) return

        // Shared viewers do not receive the creator's rating code.
        const { feedbackToken: ignoredToken, ...publicPlan } = plan

        setResult({
          token: shareToken,
          plan: { ...publicPlan, isShared: true },
          error: '',
        })
      } catch (error) {
        if (controller.signal.aborted) return

        setResult({
          token: shareToken,
          plan: null,
          error:
            error.name === 'TimeoutError'
              ? 'The shared plan took too long to load. Refresh to try again.'
              : error.message || 'Could not load this shared plan.',
        })
      }
    }

    loadPlan()

    return () => controller.abort()
  }, [shareToken])

  if (result.token !== shareToken) {
    return (
      <main
        className="flex min-h-svh flex-col items-center
          justify-center gap-6 bg-paper px-6 text-center text-ink"
      >
        <Motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : { rotate: [0, 360] }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Compass size={64} strokeWidth={1.5} />
        </Motion.div>

        <p role="status" className="text-lg font-bold">
          Opening shared itinerary…
        </p>
      </main>
    )
  }

  if (result.error) {
    return (
      <main
        className="flex min-h-svh items-center justify-center
          bg-paper px-6 text-center text-ink"
      >
        <div className="max-w-lg">
          <h1 className="font-heading text-5xl uppercase">
            Let’s find your way back.
          </h1>

          <p role="alert" className="mt-5 leading-relaxed">
            {result.error}
          </p>

          <Link
            to="/"
            className="mt-7 inline-block rounded-full border-2
              border-ink bg-lime px-6 py-3 font-bold"
          >
            Back to MoodTrip
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <div
        className="border-b-2 border-ink bg-aqua
          px-6 py-3 text-center text-sm font-bold"
      >
        Shared itinerary · View only
      </div>

      <ItineraryView
        key={result.plan.id}
        plan={result.plan}
      />
    </>
  )
}