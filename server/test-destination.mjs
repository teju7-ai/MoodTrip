import { getCandidatePlaces } from './places.mjs'

try {
  console.log('Finding cultural places in Jaipur...')

  const result = await getCandidatePlaces({
    destination: 'Jaipur, Rajasthan, India',
    mood: 'cultural',
  })

  console.log('Destination:', result.location.name)
  console.log('Places found:', result.places.length)

  for (const place of result.places.slice(0, 5)) {
    console.log(`- ${place.name} | Mood score: ${place.moodScore}`)
  }
} catch (error) {
  console.log('Search failed:', error.message)
  process.exitCode = 1
}