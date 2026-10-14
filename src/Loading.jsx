import {
  motion as Motion,
  MotionConfig,
  useReducedMotion,
} from 'framer-motion'
import { Plane, Sun, MapPin, Sparkles } from 'lucide-react'

export default function Loading({ destination, onCancel }) {
  const reduceMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion="user">
      <main
        aria-busy="true"
        className="flex min-h-svh items-center justify-center
          bg-paper px-6 py-16 text-ink"
      >
        <div className="w-full max-w-xl text-center">
          <div
            aria-hidden="true"
            className="relative mx-auto mb-10 h-48 w-48"
          >
            <div
              className="absolute inset-0 rounded-full
                border-2 border-dashed border-ink/30"
            />

            <Motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { rotate: [0, 360] }
              }
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0"
            >
              <div
                className="absolute left-1/2 top-0 grid
                  h-12 w-12 -translate-x-1/2 -translate-y-1/2
                  place-items-center rounded-xl border-2
                  border-ink bg-aqua"
              >
                <Plane size={26} />
              </div>
            </Motion.div>

            <Motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -10, 0],
                      rotate: [-5, 5, -5],
                    }
              }
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-10 grid place-items-center
                rounded-3xl border-2 border-ink bg-lime
                shadow-[5px_5px_0_#171714]"
            >
              <Sun size={54} strokeWidth={1.7} />
            </Motion.div>

            <div
              className="absolute -bottom-2 -right-2 grid
                h-12 w-12 place-items-center rounded-xl
                border-2 border-ink bg-pink"
            >
              <MapPin size={25} />
            </div>
          </div>

          <div role="status" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-widest">
              Your next adventure is taking shape
            </p>

            <h1
              className="mt-5 font-heading text-5xl
                uppercase leading-none md:text-7xl"
            >
              Finding your
              <br />
              kind of getaway.
            </h1>

            <p className="mt-6 break-words text-lg">
              Planning your trip to{' '}
              <span className="font-bold">{destination}</span>.
            </p>
          </div>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed">
            We’re finding places and arranging your days around
            your mood and budget. This may take a few minutes.
          </p>

          <div
            aria-hidden="true"
            className="mt-7 flex items-center justify-center gap-3"
          >
            {[0, 1, 2].map((index) => (
              <Motion.span
                key={index}
                animate={
                  reduceMotion
                    ? undefined
                    : { y: [0, -8, 0] }
                }
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.15,
                }}
              >
                <Sparkles size={20} />
              </Motion.span>
            ))}
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-8 rounded-full border-2 border-ink
                bg-paper px-6 py-3 text-sm font-bold
                transition-colors hover:bg-lime"
            >
              Back to my choices
            </button>
          )}
        </div>
      </main>
    </MotionConfig>
  )
}