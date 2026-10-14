import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Compass, ArrowLeft, Download, Check } from 'lucide-react'
import { getEstimatedTotal } from './sampleItinerary'
import ShareButton from './ShareButton.jsx'

function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function readSavedPlan() {
  try {
    const saved = sessionStorage.getItem('moodtrip:lastPlan')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function isValidPlan(plan) {
  return Boolean(
    plan &&
      typeof plan.destination === 'string' &&
      typeof plan.mood === 'string' &&
      Array.isArray(plan.itinerary) &&
      plan.itinerary.length > 0 &&
      plan.itinerary.every(
        (day) =>
          typeof day.title === 'string' &&
          Array.isArray(day.stops) &&
          day.stops.length > 0 &&
          day.stops.every(
            (stop) =>
              typeof stop.name === 'string' &&
              Number.isFinite(stop.estimatedCost),
          ),
      ),
  )
}

export default function Confirm() {
  const location = useLocation()
  const [plan] = useState(
    () => location.state?.plan ?? readSavedPlan(),
  )

  if (!isValidPlan(plan)) {
    return (
      <main
        className="flex min-h-svh items-center justify-center
          bg-paper px-6 text-center text-ink"
      >
        <div>
          <h1 className="font-heading text-5xl uppercase">
            Your next trip starts here.
          </h1>
          <p className="mt-5">
            Create an itinerary before confirming your plan.
          </p>
          <Link
            to="/planner"
            className="mt-7 inline-block rounded-full border-2
              border-ink bg-lime px-6 py-3 font-bold"
          >
            Plan my trip
          </Link>
        </div>
      </main>
    )
  }

  const total = getEstimatedTotal(plan)

  return (
    <div className="min-h-svh bg-paper text-ink">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-area {
            max-width: none !important;
            padding: 0 !important;
          }

          .print-card {
            break-inside: avoid;
            box-shadow: none !important;
            background: white !important;
            margin-bottom: 16px !important;
          }

          .print-area h1 {
            font-size: 36px !important;
          }

          .print-area h2 {
            font-size: 26px !important;
          }

          .print-area p,
          .print-area li,
          .print-area dt,
          .print-area dd {
            font-size: 11pt !important;
          }
        }
      `}</style>

      <header
        className="print-hide mx-auto flex max-w-5xl
          items-center justify-between px-6 py-6"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-black"
        >
          <Compass size={28} />
          MOODTRIP ✳
        </Link>

        <Link
          to="/itinerary"
          state={{ plan }}
          className="flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft size={16} />
          Back to itinerary
        </Link>
      </header>

      <main className="print-area mx-auto max-w-5xl px-6 pb-16 pt-8">
        <section
          className="print-card rounded-3xl border-2 border-ink
            bg-lime p-6 shadow-[6px_6px_0_#171714] md:p-10"
        >
          <div
            className="mb-5 inline-flex items-center gap-2
              rounded-full border-2 border-ink bg-paper
              px-4 py-2 text-xs font-bold uppercase tracking-widest"
          >
            <Check size={16} />
            Your plan summary
          </div>

          <h1
            className="break-words font-heading text-5xl
              uppercase leading-none md:text-7xl"
          >
            Your getaway, sorted.
          </h1>

          <p className="mt-5 break-words text-2xl font-black">
            {plan.destination}
          </p>

          <dl className="mt-7 grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-sm">Duration</dt>
              <dd className="mt-1 text-xl font-black">
                {plan.days} {plan.days === 1 ? 'day' : 'days'}
              </dd>
            </div>

            <div>
              <dt className="text-sm">Mood</dt>
              <dd className="mt-1 text-xl font-black capitalize">
                {plan.mood}
              </dd>
            </div>

            <div>
              <dt className="text-sm">Estimated listed costs</dt>
              <dd className="mt-1 text-xl font-black">
                {formatMoney(total)}
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-sm leading-relaxed">
            {plan.isDemo
              ? 'This is a sample itinerary.'
              : `Your activities and food budget: ${formatMoney(plan.budget)}.`}
            {' '}This is a travel plan; no bookings have been made.
          </p>

          <div className="print-hide mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full
                border-2 border-ink bg-ink px-6 py-3
                font-bold text-paper"
            >
              <Download size={18} />
              Save as PDF
            </button>

            <Link
              to="/planner"
              className="rounded-full border-2 border-ink
                bg-paper px-6 py-3 font-bold"
            >
              Plan another trip
            </Link>
          </div>

          <p className="print-hide mt-4 text-sm">
            To save a PDF, choose “Save as PDF” in the print window.
          </p>

          <ShareButton key={plan.id} plan={plan} />
        </section>

        <section className="mt-10" aria-label="Full itinerary summary">
          {plan.itinerary.map((day) => (
            <article
              key={day.day}
              className="print-card mb-6 rounded-3xl
                border-2 border-ink bg-white p-6 md:p-8"
            >
              <h2 className="font-heading text-3xl uppercase md:text-4xl">
                Day {day.day} — {day.title}
              </h2>

              <ol className="mt-6 space-y-6">
                {day.stops.map((stop) => (
                  <li
                    key={stop.id}
                    className="border-t border-ink/20 pt-4"
                  >
                    <p className="text-sm font-bold">
                      {stop.period} · {stop.time} · {stop.duration}
                    </p>

                    <h3 className="mt-2 text-lg font-black">
                      {stop.name}
                    </h3>

                    {stop.address && (
                      <p className="mt-1 text-sm text-ink/65">
                        {stop.address}
                      </p>
                    )}

                    <p className="mt-2 text-sm leading-relaxed">
                      {stop.description}
                    </p>

                    <p className="mt-2 text-sm font-bold">
                      Estimated cost: {formatMoney(stop.estimatedCost)}
                    </p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>

        <section className="print-card rounded-2xl border border-ink/25 p-5">
          <h2 className="text-lg font-bold">Before you go</h2>
          <p className="mt-3 text-sm leading-relaxed">
            Costs are estimates, not live prices. The total covers
            listed activities and meals per person only. Flights,
            hotels, transport, and unlisted meals are excluded.
            Check current opening hours, prices, availability, and
            travel times before visiting.
          </p>
        </section>

        {!plan.isDemo && (
          <p className="mt-8 text-center text-xs">
            Places powered by{' '}
            <a href="https://www.geoapify.com/" className="underline">
              Geoapify
            </a>
            . Map data ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              className="underline"
            >
              OpenStreetMap contributors
            </a>
            .
          </p>
        )}
      </main>
    </div>
  )
}