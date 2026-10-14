import { Link } from 'react-router-dom'
import {
  motion as Motion,
  MotionConfig,
} from 'framer-motion'
import {
  Compass,
  MapPin,
  Sparkles,
  Wallet,
  Star,
  ArrowUpRight,
} from 'lucide-react'

const aiSteps = [
  {
    icon: MapPin,
    title: 'Find actual places',
    text: 'Geoapify finds the destination and searches for nearby place records, including attractions and food options.',
    color: 'bg-aqua',
  },
  {
    icon: Compass,
    title: 'Match the mood',
    text: 'Our category rules connect moods to places. Cultural favors museums and historic sights; relaxing favors beaches, parks, and cafés.',
    color: 'bg-lavender',
  },
  {
    icon: Star,
    title: 'Learn from feedback',
    text: 'Saved ratings make small adjustments to place rankings for the same mood. A few neutral starting ratings keep one review from dominating.',
    color: 'bg-pink',
  },
  {
    icon: Sparkles,
    title: 'Arrange the days',
    text: 'An AI model accessed through OpenRouter chooses from the supplied places and returns a structured day-by-day outline.',
    color: 'bg-lime',
  },
  {
    icon: Wallet,
    title: 'Check the result',
    text: 'The backend checks the number of days, place IDs, estimated total, repeated IDs, visit timing, meal stops, and mood matches.',
    color: 'bg-paper',
  },
]

const researchSteps = [
  {
    title: 'Understand travelers',
    status: 'Planned',
    text: 'Interview travelers about planning frustrations, budget decisions, and what they want from a short trip.',
  },
  {
    title: 'Refine the mood taxonomy',
    status: 'Initial version built',
    text: 'Start with five moods, then use interview findings to check whether those categories reflect real traveler needs.',
  },
  {
    title: 'Build and iterate',
    status: 'Prototype built',
    text: 'Use the working Home, Planner, Itinerary, and Confirm pages to explore the experience and fix problems.',
  },
  {
    title: 'Test with users',
    status: 'Planned',
    text: 'Ask participants to create and save a plan. Observe confusion, completion time, and whether the recommendations fit their expectations.',
  },
]

export default function About() {
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
            className="rounded-full border-2 border-ink
              bg-lime px-4 py-2 text-sm font-bold"
          >
            Plan my trip
          </Link>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-20">
          <Motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="py-14 md:py-20"
          >
            <p className="text-xs font-bold uppercase tracking-widest">
              Behind the getaway
            </p>

            <h1
              className="mt-5 font-heading text-6xl
                uppercase leading-none md:text-8xl"
            >
              Different people.
              <br />
              Different trips.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed">
              A budget adventurer and a couple looking for a quiet
              escape shouldn’t have to sift through the same generic
              list. MoodTrip explores a more personal starting point:
              your destination, time, budget, and mood.
            </p>
          </Motion.section>

          <section aria-labelledby="ai-heading">
            <h2
              id="ai-heading"
              className="font-heading text-5xl uppercase md:text-6xl"
            >
              How the AI works
            </h2>

            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {aiSteps.map((step, index) => {
                const Icon = step.icon

                return (
                  <Motion.article
                    key={step.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45 }}
                    className={`rounded-3xl border-2 border-ink
                      p-6 shadow-[4px_4px_0_#171714] ${step.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon aria-hidden="true" size={32} />
                      <span className="font-heading text-3xl">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-black">
                      {step.title}
                    </h3>

                    <p className="mt-3 leading-relaxed">
                      {step.text}
                    </p>
                  </Motion.article>
                )
              })}
            </div>

            <div
              className="mt-7 rounded-2xl border-2 border-ink
                bg-white p-6 text-sm leading-relaxed"
            >
              <h3 className="text-lg font-bold">What this prototype can tell you</h3>

              <p className="mt-3">
                Places come from a location dataset. Descriptions,
                suggested times, and costs are AI-assisted estimates.
                Opening hours, availability, travel times, and prices
                are not verified.
              </p>

              <p className="mt-3">
                Budgets are in INR, per person, for listed activities
                and meals. Flights, hotels, transport, and unlisted
                meals are excluded. The current search covers a
                15 km radius around the resolved destination.
              </p>

              <p className="mt-3">
                Feedback ranking is a simple statistical adjustment,
                not a trained recommendation model. A whole-plan
                rating is an indirect signal about its individual
                places. User testing is needed to assess whether
                recommendations improve.
              </p>
            </div>
          </section>

          <section className="mt-20" aria-labelledby="research-heading">
            <p className="text-xs font-bold uppercase tracking-widest">
              Design thinking
            </p>

            <h2
              id="research-heading"
              className="mt-4 font-heading text-5xl uppercase md:text-6xl"
            >
              Build. Listen. Improve.
            </h2>

            <p className="mt-5 max-w-2xl leading-relaxed">
              Our prototype gives us something concrete to test.
              Interviews and usability studies are the next steps,
              rather than evidence we already have.
            </p>

            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {researchSteps.map((step) => (
                <Motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="rounded-3xl border-2 border-ink bg-white p-6"
                >
                  <span
                    className="inline-block rounded-full border
                      border-ink bg-lime px-3 py-1 text-xs font-bold"
                  >
                    {step.status}
                  </span>

                  <h3 className="mt-5 text-xl font-black">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-relaxed">
                    {step.text}
                  </p>
                </Motion.article>
              ))}
            </div>
          </section>

          <section
            className="mt-16 rounded-3xl border-2 border-ink
              bg-ink p-8 text-center text-paper"
          >
            <h2 className="font-heading text-5xl uppercase">
              Less deciding. More discovering.
            </h2>

            <Link
              to="/planner"
              className="mt-7 inline-flex items-center gap-3
                rounded-full border-2 border-paper bg-lime
                px-6 py-3 font-bold text-ink"
            >
              Plan my trip
              <ArrowUpRight size={20} />
            </Link>
          </section>
        </main>
      </div>
    </MotionConfig>
  )
}