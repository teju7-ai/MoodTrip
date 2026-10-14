import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Rating from './Rating.jsx'
import {
  AnimatePresence,
  motion as Motion,
  MotionConfig,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  MapPin,
  Clock,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react'
import {
  sampleItinerary,
  getEstimatedTotal,
  getMapsUrl,
} from './sampleItinerary'

const periodIcons = {
  Morning: Sun,
  Afternoon: Sunset,
  Evening: Moon,
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function isUsablePlan(plan) {
  return Boolean(
    plan &&
      typeof plan.id === 'string' &&
      typeof plan.destination === 'string' &&
      typeof plan.mood === 'string' &&
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
              typeof stop.period === 'string' &&
              typeof stop.time === 'string' &&
              typeof stop.duration === 'string' &&
              typeof stop.description === 'string' &&
              typeof stop.mapsQuery === 'string' &&
              Number.isFinite(stop.estimatedCost) &&
              stop.estimatedCost >= 0,
          ),
      ),
  )
}

function getSavedPlan() {
  try {
    const saved = sessionStorage.getItem('moodtrip:lastPlan')
    const plan = saved ? JSON.parse(saved) : null
    return isUsablePlan(plan) ? plan : null
  } catch {
    return null
  }
}

export default function Itinerary() {
  const location = useLocation()
  const incomingPlan = location.state?.plan

  const plan = isUsablePlan(incomingPlan)
    ? incomingPlan
    : getSavedPlan() ?? sampleItinerary

  return <ItineraryView key={plan.id} plan={plan} />
}

export function ItineraryView({ plan }) {
  const [activeDay, setActiveDay] = useState(0)

  const day = plan.itinerary[activeDay]
  const total = getEstimatedTotal(plan)
  const dayTotal = day.stops.reduce(
    (sum, stop) => sum + stop.estimatedCost,
    0,
  )

  const isDemo = plan.isDemo === true

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh bg-paper text-ink">
        <header
          className="mx-auto flex max-w-6xl items-center
            justify-between px-6 py-6"
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-black"
          >
            <Compass size={28} />
            MOODTRIP ✳
          </Link>

          <Link
            to="/planner"
            className="flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Plan another trip
          </Link>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
          <Motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-ink
              bg-lime p-6 shadow-[7px_7px_0_#171714] md:p-10"
          >
            <span
              className="inline-block rounded-full border-2 border-ink
                bg-paper px-3 py-1 text-xs font-bold uppercase tracking-widest"
            >
              {isDemo
                ? 'Demo itinerary'
                : plan.isShared
                  ? 'Shared itinerary'
                  : 'Your AI itinerary'}
            </span>

            <h1
              className="mt-6 break-words font-heading text-5xl
                uppercase leading-none md:text-7xl"
            >
              Hello, {plan.destination}.
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-relaxed">
              A {plan.days}-day {plan.mood} getaway in {plan.destination},
              with suggested stops, timings, and estimated costs.
            </p>

            <dl className="mt-8 grid gap-5 sm:grid-cols-3">
              <div>
                <dt className="text-sm">Duration</dt>
                <dd className="mt-1 text-2xl font-black">
                  {plan.days} {plan.days === 1 ? 'day' : 'days'}
                </dd>
              </div>

              <div>
                <dt className="text-sm">Mood</dt>
                <dd className="mt-1 text-2xl font-black capitalize">
                  {plan.mood}
                </dd>
              </div>

              <div>
                <dt className="text-sm">Listed activities and food</dt>
                <dd className="mt-1 text-2xl font-black">
                  {formatMoney(total)}
                </dd>
              </div>
            </dl>

            {!isDemo && (
              <div className="mt-7 border-t border-ink/25 pt-5">
                <p className="text-sm font-bold">
                  Your budget: {formatMoney(plan.budget)}
                </p>

                <p className="mt-2 text-sm">
                  Search location: {plan.resolvedDestination}
                </p>

                <p className="mt-2 text-sm">
                  Places searched within{' '}
                  {plan.searchRadiusMeters / 1000} km of this location.
                </p>
              </div>
            )}
          </Motion.section>

          <div
            className="mt-7 rounded-2xl border border-ink/20
              bg-white p-4 text-sm leading-relaxed"
          >
            <p>
              {isDemo
                ? 'This is a sample Goa plan, not an AI-generated result.'
                : 'This plan uses fetched place records and AI suggestions.'}
            </p>

            <p className="mt-2">
              Costs are estimates, not live prices. The total covers only
              listed activities and meals per person. Flights, hotels,
              transport, and unlisted meals are excluded.
              Suggested times, opening hours, and travel times need
              checking before you visit.
            </p>
          </div>

          <section className="mt-12" aria-label="Day-by-day itinerary">
            <div className="flex flex-wrap gap-3">
              {plan.itinerary.map((item, index) => (
                <button
                  key={item.day}
                  type="button"
                  aria-pressed={activeDay === index}
                  onClick={() => setActiveDay(index)}
                  className={`rounded-full border-2 border-ink
                    px-6 py-3 font-bold transition-colors
                    ${
                      activeDay === index
                        ? 'bg-ink text-paper'
                        : 'bg-paper hover:bg-lime'
                    }`}
                >
                  Day {item.day}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <Motion.div
                key={day.day}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                <div
                  className="mb-7 flex flex-col justify-between
                    gap-3 sm:flex-row sm:items-end"
                >
                  <h2
                    className="font-heading text-4xl uppercase
                      leading-tight md:text-5xl"
                  >
                    {day.title}
                  </h2>

                  <p className="shrink-0 text-sm font-bold">
                    Day estimate: {formatMoney(dayTotal)}
                  </p>
                </div>

                <div className="grid gap-5">
                  {day.stops.map((stop, index) => {
                    const Icon = periodIcons[stop.period] || Sun

                    return (
                      <Motion.article
                        key={stop.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.1,
                        }}
                        className="rounded-3xl border-2 border-ink
                          bg-white p-6 shadow-[4px_4px_0_#171714] md:p-8"
                      >
                        <div
                          className="flex flex-col gap-6
                            md:flex-row md:items-start"
                        >
                          <div
                            aria-hidden="true"
                            className="grid h-16 w-16 shrink-0
                              place-items-center rounded-2xl
                              border-2 border-ink bg-lavender"
                          >
                            <Icon size={32} strokeWidth={1.7} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs font-bold uppercase
                                tracking-widest"
                            >
                              {stop.period} · {stop.time}
                            </p>

                            <h3 className="mt-3 break-words text-2xl font-black">
                              {stop.name}
                            </h3>

                            {stop.address && (
                              <p className="mt-2 text-sm text-ink/60">
                                {stop.address}
                              </p>
                            )}

                            <p
                              className="mt-3 max-w-2xl
                                leading-relaxed text-ink/75"
                            >
                              {stop.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-5">
                              <span
                                className="inline-flex items-center
                                  gap-2 text-sm"
                              >
                                <Clock aria-hidden="true" size={16} />
                                {stop.duration}
                              </span>

                              <span className="text-sm font-bold">
                                {stop.estimatedCost === 0
                                  ? 'Estimated cost: ₹0'
                                  : `Approx. ${formatMoney(stop.estimatedCost)}`}
                              </span>
                            </div>
                          </div>

                          <a
                            href={getMapsUrl(stop.mapsQuery)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${stop.name} on Maps, opens a new tab`}
                            className="inline-flex w-fit shrink-0
                              items-center gap-2 rounded-full
                              border-2 border-ink bg-paper px-4 py-3
                              text-sm font-bold transition-colors hover:bg-lime"
                          >
                            <MapPin aria-hidden="true" size={16} />
                            View on Maps
                            <ArrowUpRight aria-hidden="true" size={16} />
                          </a>
                        </div>
                      </Motion.article>
                    )
                  })}
                </div>
              </Motion.div>
            </AnimatePresence>
          </section>

          <Rating plan={plan} />

         <div className="mt-10 flex flex-wrap justify-center gap-4">
  <Link
    to="/confirm"
    state={{ plan }}
    className="inline-flex items-center gap-3 rounded-full
      border-2 border-ink bg-lime px-6 py-4 font-bold
      shadow-[4px_4px_0_#171714]"
  >
    Confirm plan
    <ArrowUpRight size={20} />
  </Link>

  <Link
    to="/planner"
    className="inline-flex items-center gap-3 rounded-full
      border-2 border-ink bg-ink px-6 py-4 font-bold text-paper"
  >
    Plan another trip
    <ArrowUpRight size={20} />
  </Link>
</div>

          {!isDemo && (
            <p className="mt-10 text-center text-xs leading-relaxed">
              Places powered by{' '}
              <a
                href="https://www.geoapify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Geoapify
              </a>
              . Map data ©{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                OpenStreetMap contributors
              </a>
              .
            </p>
          )}
        </main>
      </div>
    </MotionConfig>
  )
}