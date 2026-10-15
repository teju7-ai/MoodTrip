import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AnimatePresence,
  motion as Motion,
  useReducedMotion,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Sun,
  Mountain,
  Landmark,
  Utensils,
  Moon,
} from 'lucide-react'
import Loading from './Loading.jsx'
import DestinationSearch from './DestinationSearch.jsx'
import { requestItinerary } from './api.js'

const moods = [
  { id: 'relaxing', label: 'Relaxing', icon: Sun, color: 'bg-lime' },
  {
    id: 'adventurous',
    label: 'Adventurous',
    icon: Mountain,
    color: 'bg-aqua',
  },
  {
    id: 'cultural',
    label: 'Cultural',
    icon: Landmark,
    color: 'bg-lavender',
  },
  { id: 'foodie', label: 'Foodie', icon: Utensils, color: 'bg-pink' },
  { id: 'nightlife', label: 'Nightlife', icon: Moon, color: 'bg-paper' },
]

const questions = [
  {
    title: 'Where to?',
    description: 'A familiar favorite or somewhere completely new.',
  },
  {
    title: 'How long?',
    description: 'A quick escape or a whole week of possibilities.',
  },
  {
    title: 'What’s your budget?',
    description: 'Good memories should fit your wallet.',
  },
  {
    title: 'What’s the feeling?',
    description: 'Choose the mood that feels most like your trip.',
  },
]

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function Planner() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const requestRef = useRef(null)

  const [selectedDestination, setSelectedDestination] = useState(null)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [reviewing, setReviewing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const [trip, setTrip] = useState({
    destination: '',
    days: 3,
    budget: 10000,
    mood: '',
  })

  const selectedMood = moods.find((mood) => mood.id === trip.mood)

  useEffect(() => {
    return () => {
      requestRef.current?.abort()
    }
  }, [])

  function updateTrip(field, value) {
    setError('')
    setTrip((current) => ({ ...current, [field]: value }))
  }

  function goBack() {
    setDirection(-1)
    setStep((current) => Math.max(0, current - 1))
  }

  function handleNext(event) {
    event.preventDefault()

    if (step === 0 && !selectedDestination) return
    if (step === 3 && !trip.mood) return

    if (step === 3) {
      setTrip((current) => ({
        ...current,
        destination: current.destination.trim(),
      }))
      setReviewing(true)
      return
    }

    setDirection(1)
    setStep((current) => current + 1)
  }

  function cancelGeneration() {
    const controller = requestRef.current
    requestRef.current = null
    controller?.abort()
    setGenerating(false)
    setError('')
  }

  async function handleGenerate() {
    if (requestRef.current) return

    const controller = new AbortController()
    requestRef.current = controller

    setError('')
    setGenerating(true)

    try {
      const plan = await requestItinerary(trip, controller.signal)

      // Ignore a result if the user cancelled its request.
      if (requestRef.current !== controller) return

      // Keep a copy for refreshing the results page in this browser tab.
      try {
        sessionStorage.setItem('moodtrip:lastPlan', JSON.stringify(plan))
      } catch {
        // Navigation still works if browser storage is unavailable.
      }

      requestRef.current = null
      setGenerating(false)

      navigate('/itinerary', {
        state: { plan },
      })
    } catch (requestError) {
      if (requestRef.current !== controller) return

      requestRef.current = null
      setGenerating(false)

      if (requestError.name !== 'AbortError') {
        setError(
          requestError.message || 'Could not generate your itinerary.',
        )
      }
    }
  }

  const canContinue =
    step === 0
      ? Boolean(selectedDestination)
      : step === 3
        ? Boolean(trip.mood)
        : true

  if (generating) {
    return (
      <Loading
        destination={trip.destination}
        onCancel={cancelGeneration}
      />
    )
  }

  return (
    <div className="min-h-svh bg-paper text-ink">
      <header
        className="mx-auto flex max-w-5xl items-center
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
          to="/"
          className="flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-8 md:pt-16">
        {reviewing ? (
          <Motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-ink bg-lime
              p-6 shadow-[7px_7px_0_#171714] md:p-10"
          >
            <p className="text-xs font-bold uppercase tracking-widest">
              Your travel vibe
            </p>

            <h1 className="mt-4 font-heading text-5xl uppercase md:text-7xl">
              This sounds like you.
            </h1>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm">Destination</dt>
                <dd className="mt-1 break-words text-2xl font-black">
                  {selectedDestination?.label ?? trip.destination}
                </dd>
              </div>

              <div>
                <dt className="text-sm">Duration</dt>
                <dd className="mt-1 text-2xl font-black">
                  {trip.days} {trip.days === 1 ? 'day' : 'days'}
                </dd>
              </div>

              <div>
                <dt className="text-sm">Activities and food budget</dt>
                <dd className="mt-1 text-2xl font-black">
                  {formatMoney(trip.budget)}
                </dd>
              </div>

              <div>
                <dt className="text-sm">Mood</dt>
                <dd className="mt-1 text-2xl font-black">
                  {selectedMood?.label}
                </dd>
              </div>
            </dl>

            <p className="mt-7 text-sm leading-relaxed">
              Budget is per person for listed activities and meals
              across the whole trip. Flights, hotels, transport,
              and unlisted meals are excluded.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border-2 border-ink
                  bg-paper p-4"
              >
                <p className="font-bold">Let’s try that again.</p>
                <p className="mt-2 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setReviewing(false)
                }}
                className="inline-flex items-center gap-2 rounded-full
                  border-2 border-ink bg-paper px-6 py-3 font-bold"
              >
                <ArrowLeft size={18} />
                Edit my choices
              </button>

              <Motion.button
                type="button"
                onClick={handleGenerate}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full
                  border-2 border-ink bg-ink px-6 py-3
                  font-bold text-paper"
              >
                Generate my itinerary
                <ArrowRight size={18} />
              </Motion.button>
            </div>

            <p className="mt-5 text-sm leading-relaxed">
              Place records come from Geoapify. AI arranges the visits
              and estimates costs; prices and opening hours are not verified.
            </p>
          </Motion.section>
        ) : (
          <>
            <div className="mb-8">
              <div
                className="flex justify-between text-xs
                  font-bold uppercase tracking-widest"
              >
                <span>Make room for a getaway</span>
                <span>Step {step + 1} of 4</span>
              </div>

              <div
                role="progressbar"
                aria-label="Planner progress"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={step + 1}
                className="mt-4 h-3 overflow-hidden rounded-full
                  border-2 border-ink bg-paper"
              >
                <Motion.div
                  animate={{ width: `${((step + 1) / 4) * 100}%` }}
                  className="h-full bg-lime"
                />
              </div>
            </div>

            <form
              onSubmit={handleNext}
              className="rounded-3xl border-2 border-ink bg-white
                p-6 shadow-[7px_7px_0_#171714] md:p-10"
            >
              <AnimatePresence mode="wait" initial={false}>
                <Motion.div
                  key={step}
                  initial={{
                    opacity: 0,
                    x: reduceMotion ? 0 : direction * 35,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: reduceMotion ? 0 : direction * -35,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <h1
                    className="font-heading text-5xl uppercase
                      leading-none md:text-7xl"
                  >
                    {questions[step].title}
                  </h1>

                  <p className="mt-4 leading-relaxed">
                    {questions[step].description}
                  </p>

                  <div className="mt-8">
                    {step === 0 && (
                      <DestinationSearch
                        selected={selectedDestination}
                        onSelect={(place) => {
                          setSelectedDestination(place)
                          setError('')
                          setTrip((current) => ({
                            ...current,
                            destination: place?.name ?? '',
                            destinationToken: place?.token,
                          }))
                        }}
                      />
                    )}

                    {step === 1 && (
                      <>
                        <label htmlFor="days" className="block font-bold">
                          Trip duration
                        </label>

                        <output
                          htmlFor="days"
                          className="my-6 block font-heading text-7xl"
                        >
                          {trip.days} {trip.days === 1 ? 'DAY' : 'DAYS'}
                        </output>

                        <input
                          id="days"
                          type="range"
                          min={1}
                          max={7}
                          value={trip.days}
                          onChange={(event) =>
                            updateTrip('days', Number(event.target.value))
                          }
                          className="h-3 w-full cursor-pointer accent-ink"
                        />

                        <div className="mt-3 flex justify-between text-sm">
                          <span>1 day</span>
                          <span>7 days</span>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <label htmlFor="budget" className="block font-bold">
                          Activities and food budget
                        </label>

                        <output
                          htmlFor="budget"
                          className="my-6 block font-heading text-6xl"
                        >
                          {formatMoney(trip.budget)}
                        </output>

                        <input
                          id="budget"
                          type="range"
                          min={1000}
                          max={50000}
                          step={500}
                          value={trip.budget}
                          onChange={(event) =>
                            updateTrip('budget', Number(event.target.value))
                          }
                          className="h-3 w-full cursor-pointer accent-ink"
                        />

                        <div className="mt-3 flex justify-between text-sm">
                          <span>₹1,000</span>
                          <span>₹50,000</span>
                        </div>

                        <p className="mt-6 text-sm leading-relaxed text-ink/70">
                          Per person, for listed activities and meals
                          across the whole trip. Flights, hotels,
                          transport, and unlisted meals are excluded.
                        </p>
                      </>
                    )}

                    {step === 3 && (
                      <fieldset>
                        <legend className="mb-4 font-bold">
                          Pick one mood
                        </legend>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {moods.map((mood) => {
                            const Icon = mood.icon
                            const selected = trip.mood === mood.id

                            return (
                              <label
                                key={mood.id}
                                className={`flex cursor-pointer items-center
                                  gap-3 rounded-2xl border-2 border-ink
                                  p-4 transition-shadow ${mood.color}
                                  ${selected ? 'shadow-[4px_4px_0_#171714]' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name="mood"
                                  value={mood.id}
                                  checked={selected}
                                  onChange={() =>
                                    updateTrip('mood', mood.id)
                                  }
                                  className="h-4 w-4 accent-ink"
                                />

                                <Icon aria-hidden="true" size={24} />

                                <span className="font-bold">
                                  {mood.label}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </fieldset>
                    )}
                  </div>
                </Motion.div>
              </AnimatePresence>

              <div className="mt-10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 rounded-full
                    px-3 py-3 font-bold disabled:cursor-default
                    disabled:opacity-30"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                <Motion.button
                  type="submit"
                  disabled={!canContinue}
                  whileHover={canContinue ? { scale: 1.03 } : undefined}
                  whileTap={canContinue ? { scale: 0.97 } : undefined}
                  className="inline-flex items-center gap-2 rounded-full
                    border-2 border-ink bg-lime px-5 py-3 font-bold
                    disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === 3 ? 'Review my choices' : 'Next'}
                  <ArrowRight size={18} />
                </Motion.button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
