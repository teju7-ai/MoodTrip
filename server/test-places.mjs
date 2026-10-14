import 'dotenv/config'

const apiKey = process.env.GEOAPIFY_API_KEY

if (!apiKey) {
  console.log('Geoapify key missing. Check your .env file.')
  process.exit(1)
}

try {
  console.log('Finding places in Goa...')

  const url = new URL('https://api.geoapify.com/v2/places')

  url.search = new URLSearchParams({
    categories: 'catering.restaurant',
    filter: 'circle:73.8278,15.4909,5000',
    limit: '10',
    apiKey,
  }).toString()

  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    console.log('Places request failed.')
    console.log('Error code:', response.status)
    process.exitCode = 1
  } else {
    const data = await response.json()
    const places = data.features ?? []

    console.log(`Geoapify connected! Found ${places.length} places.`)

    for (const place of places.slice(0, 5)) {
      console.log(
        '-',
        place.properties.name ??
          place.properties.formatted ??
          'Unnamed place',
      )
    }
  }
} catch (error) {
  console.log(
    error.name === 'TimeoutError'
      ? 'The request timed out after 30 seconds.'
      : 'Could not connect to Geoapify.',
  )
  process.exitCode = 1
}