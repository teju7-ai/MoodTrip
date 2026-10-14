import { useState } from 'react'
import {
  motion as Motion,
  MotionConfig,
  useReducedMotion,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  Mountain,
  Moon,
  Plane,
  Sparkles,
  Sun,
  Utensils,
  Landmark,
} from 'lucide-react'

import { Link } from 'react-router-dom'

const AnimatedLink = Motion.create(Link)

const moods = [
  {
    id: 'relaxing',
    name: 'Slow down',
    description: 'Beach days. Quiet cafés. Zero rush.',
    icon: Sun,
    color: 'bg-lime',
    tilt: -3,
  },
  {
    id: 'adventurous',
    name: 'Go wild',
    description: 'New trails. Big views. A little adrenaline.',
    icon: Mountain,
    color: 'bg-aqua',
    tilt: 3,
  },
  {
    id: 'cultural',
    name: 'Get curious',
    description: 'Local stories. Art. Hidden history.',
    icon: Landmark,
    color: 'bg-lavender',
    tilt: -2,
  },
  {
    id: 'foodie',
    name: 'Taste everything',
    description: 'Street food. Local favorites. One more bite.',
    icon: Utensils,
    color: 'bg-pink',
    tilt: 2,
  },
  {
    id: 'nightlife',
    name: 'Stay up',
    description: 'Live music. City lights. Late-night energy.',
    icon: Moon,
    color: 'bg-paper',
    tilt: -3,
  },
]

const steps = [
  {
    number: '01',
    title: 'Bring your mood.',
    text: 'Pick a destination, your budget, and how you want to feel.',
  },
  {
    number: '02',
    title: 'Find your rhythm.',
    text: 'Get a day-by-day plan built around your kind of trip.',
  },
  {
    number: '03',
    title: 'Make it yours.',
    text: 'Explore your plan, rate it, and save your favorites.',
  },
]

function Reveal({ children, className = '' }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </Motion.div>
  )
}

function FloatingSticker({ icon: Icon, className, delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute grid h-16 w-16
        place-items-center rounded-2xl border-2 border-ink
        shadow-[4px_4px_0_#171714] md:h-24 md:w-24 ${className}`}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -14, 0],
              rotate: [-8, 8, -8],
            }
      }
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <Icon className="h-9 w-9 md:h-12 md:w-12" strokeWidth={1.8} />
    </Motion.div>
  )
}

function TravelStrip() {
  const reduceMotion = useReducedMotion()
  const words = 'GOOD MOODS. GREAT TRIPS. SMALL BUDGETS. BIG MEMORIES.'

  return (
    <div
      className="overflow-hidden border-y-2 border-ink bg-lime py-5"
      aria-label={words}
    >
      <Motion.div
        aria-hidden="true"
        className="flex w-max"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-8 pr-8"
          >
            <span className="font-heading text-3xl tracking-wide md:text-5xl">
              {words}
            </span>
            <Sparkles className="h-8 w-8 shrink-0" />
          </div>
        ))}
      </Motion.div>
    </div>
  )
}

export default function App() {
  const [selectedMood, setSelectedMood] = useState(null)
  const reduceMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4
            focus:top-4 focus:z-50 focus:rounded-full focus:bg-lime
            focus:px-5 focus:py-3"
        >
          Skip to content
        </a>

        <header
          className="mx-auto flex max-w-7xl items-center
            justify-between px-6 py-6 md:px-10"
        >
          <a
            href="#"
            aria-label="MoodTrip home"
            className="flex items-center gap-2 text-xl font-black"
          >
            <Compass size={30} strokeWidth={2.5} />
            MOODTRIP<span className="text-2xl">✳</span>
          </a>

          <Link
            to="/about"
            className="rounded-full border-2 border-ink px-4 py-2
              text-sm font-bold transition-colors hover:bg-lime"
          >
            About
          </Link>
        </header>

        <main id="main">
          <section
            className="relative mx-auto max-w-7xl
              px-6 pb-24 pt-20 text-center md:px-10 md:pb-32 md:pt-24"
          >
            <FloatingSticker
              icon={Plane}
              className="left-5 top-5 bg-aqua md:left-16 md:top-14"
            />
            <FloatingSticker
              icon={Sun}
              className="right-5 top-10 bg-lime md:right-20 md:top-20"
              delay={1}
            />
            <FloatingSticker
              icon={Mountain}
              className="bottom-7 left-8 bg-lavender md:bottom-20 md:left-24"
              delay={2}
            />
            <FloatingSticker
              icon={Utensils}
              className="bottom-5 right-8 bg-pink md:bottom-16 md:right-24"
              delay={0.5}
            />

            <Motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative z-10 mx-auto max-w-4xl"
            >
              <span
                className="inline-block rounded-full border-2 border-ink
                  bg-paper px-4 py-2 text-xs font-bold uppercase tracking-widest"
              >
                Less planning. More living.
              </span>

              <h1
                className="mt-7 font-heading text-[clamp(3.6rem,10vw,8rem)]
                  uppercase leading-[0.95] tracking-tight"
              >
                Your mood.
                <br />
                Your budget.
                <br />
                <span className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-2 bottom-1 h-[45%]
                      -rotate-2 bg-lime"
                  />
                  <span className="relative">Your trip.</span>
                </span>
              </h1>

              <p
                className="mx-auto mt-8 max-w-md text-base
                  leading-relaxed md:text-lg"
              >
                Big adventure or a little escape? Find a travel plan
                that feels like you—and fits your wallet.
              </p>

              <AnimatedLink
  to="/planner"
  whileHover={{ scale: 1.04, rotate: -2 }}
  whileTap={{ scale: 0.96 }}
  className="mt-8 inline-flex items-center gap-4 rounded-full
    border-2 border-ink bg-ink px-7 py-4 font-bold text-paper"
>
  Plan my trip
  <ArrowUpRight size={22} />
</AnimatedLink>

              <a
                href="#moods"
                className="mx-auto mt-8 flex w-fit items-center gap-2
                  text-xs font-bold uppercase tracking-widest"
              >
                Start with a feeling
                <ArrowDown size={16} />
              </a>
            </Motion.div>
          </section>

          <TravelStrip />

          <section
            id="moods"
            className="scroll-mt-8 px-6 py-20 md:px-10 md:py-28"
          >
            <div className="mx-auto max-w-7xl">
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  Five moods. Endless possibilities.
                </p>
                <h2
                  className="mt-4 font-heading text-5xl
                    uppercase leading-none md:text-7xl"
                >
                  What’s your travel mood?
                </h2>
                <p className="mt-5 max-w-lg leading-relaxed">
                  No wrong answers. Just different ways to get away.
                  Pick the feeling you’re chasing.
                </p>
              </Reveal>

              <div
                className="mt-12 grid grid-cols-1 gap-5
                  sm:grid-cols-2 lg:grid-cols-5"
              >
                {moods.map((mood) => {
                  const Icon = mood.icon
                  const isSelected = selectedMood?.id === mood.id

                  return (
                    <Reveal key={mood.id} className="h-full">
                      <Motion.button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedMood(mood)}
                        whileHover={{
                          y: reduceMotion ? 0 : -10,
                          rotate: reduceMotion ? 0 : mood.tilt,
                        }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative flex h-full min-h-64 w-full
                          flex-col items-start rounded-3xl border-2
                          border-ink p-6 text-left
                          shadow-[5px_5px_0_#171714] ${mood.color}
                          ${isSelected ? 'ring-2 ring-ink ring-offset-4 ring-offset-paper' : ''}`}
                      >
                        <Icon
                          aria-hidden="true"
                          size={48}
                          strokeWidth={1.7}
                        />
                        <h3 className="mt-8 text-xl font-black">
                          {mood.name}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed">
                          {mood.description}
                        </p>
                        <span className="mt-auto pt-5 text-xs font-bold uppercase">
                          {isSelected ? '✓ Your mood' : 'Pick this mood ↗'}
                        </span>
                      </Motion.button>
                    </Reveal>
                  )
                })}
              </div>

              <p
                role="status"
                className="mt-10 min-h-7 text-center font-bold"
              >
                {selectedMood
                  ? `${selectedMood.name}? That sounds like your kind of trip.`
                  : 'Choose a card to find your travel mood.'}
              </p>
            </div>
          </section>

          <section
            id="how-it-works"
            className="scroll-mt-8 bg-ink px-6 py-20 text-paper md:px-10"
          >
            <div className="mx-auto max-w-7xl">
              <Reveal>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime">
                  How it works
                </span>
                <h2
                  className="mt-4 font-heading text-5xl
                    uppercase leading-none md:text-7xl"
                >
                  A little input.
                  <br />
                  A whole lot of possibility.
                </h2>
              </Reveal>

              <div className="mt-14 grid gap-10 md:grid-cols-3">
                {steps.map((step) => (
                  <Reveal key={step.number}>
                    <span className="font-heading text-6xl text-lime">
                      {step.number}
                    </span>
                    <h3 className="mt-5 text-2xl font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-4 max-w-xs leading-relaxed text-paper/75">
                      {step.text}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-20 text-center md:py-28">
            <Reveal>
              <Sparkles
                aria-hidden="true"
                className="mx-auto mb-6 h-12 w-12"
              />
              <h2
                className="font-heading text-6xl uppercase
                  leading-none md:text-8xl"
              >
                Go somewhere.
                <br />
                Feel something.
              </h2>
              <Motion.a
                href="#moods"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.96 }}
                className="mt-8 inline-flex items-center gap-4 rounded-full
                  border-2 border-ink bg-lime px-7 py-4 font-bold
                  shadow-[4px_4px_0_#171714]"
              >
                Find my mood
                <ArrowUpRight size={22} />
              </Motion.a>
            </Reveal>
          </section>
        </main>

        <footer
          className="mx-auto flex max-w-7xl flex-col items-center
            justify-between gap-4 border-t-2 border-ink px-6 py-7
            text-sm md:flex-row md:px-10"
        >
          <span className="font-black">MOODTRIP ✳</span>
          <p>Made for your kind of getaway.</p>
          <a href="#" className="font-bold underline underline-offset-4">
            Back to top ↑
          </a>
        </footer>
      </div>
    </MotionConfig>
  )
}