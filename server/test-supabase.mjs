import { supabase } from './supabase.mjs'

try {
  console.log('Connecting to Supabase...')

  for (const table of ['itineraries', 'ratings']) {
    const { error } = await supabase
      .from(table)
      .select('itinerary_id' === table ? 'itinerary_id' : '*')
      .limit(1)

    if (error) {
      console.log(`Could not read ${table}.`)
      console.log('Error code:', error.code)
      process.exitCode = 1
      break
    }

    console.log(`${table}: connected`)
  }

  if (!process.exitCode) {
    console.log('MoodTrip database is connected!')
  }
} catch {
  console.log('Could not connect. Check your Supabase settings.')
  process.exitCode = 1
}