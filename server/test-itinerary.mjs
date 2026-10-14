import { generateItinerary } from './generateItinerary.mjs'

try {
  console.log('Building a 2-day cultural trip to Jaipur...')
  console.log('This may take a minute or two.')

  const plan = await generateItinerary({
    destination: 'Jaipur, Rajasthan, India',
    days: 2,
    budget: 10000,
    mood: 'cultural',
  })

  console.log('\nItinerary generated!')
  console.log('Destination:', plan.resolvedDestination)
  console.log('Mood:', plan.mood)
  console.log('Estimated total: ₹' + plan.estimatedTotal)
  console.log('Budget: ₹' + plan.budget)
  console.log('Summary:', plan.summary)

  for (const day of plan.itinerary) {
    console.log(`\nDay ${day.day}: ${day.title}`)

    for (const stop of day.stops) {
      console.log(
        `${stop.period} · ${stop.time} · ${stop.name} · ₹${stop.estimatedCost}`,
      )
    }
  }
} catch (error) {
  console.log('Could not generate the itinerary:', error.message)
  process.exitCode = 1
}