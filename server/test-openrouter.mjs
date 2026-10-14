import 'dotenv/config'

const apiKey = process.env.OPENROUTER_API_KEY

if (!apiKey) {
  console.log('OpenRouter key missing. Check your .env file.')
  process.exit(1)
}

try {
  console.log('Connecting to OpenRouter...')

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'user',
            content: 'Reply with exactly: MoodTrip AI is connected!',
          },
        ],
      }),
      signal: AbortSignal.timeout(60000),
    },
  )

  const data = await response.json()

  if (!response.ok || data.error) {
    console.log('Connection failed.')
    console.log('Error code:', data.error?.code ?? response.status)
    process.exitCode = 1
  } else {
    const text = data.choices?.[0]?.message?.content

    if (text) {
      console.log(text)
    } else {
      console.log('The request completed but returned no text.')
      process.exitCode = 1
    }
  }
} catch (error) {
  console.log(
    error.name === 'TimeoutError'
      ? 'The request timed out after 60 seconds.'
      : 'Connection failed before a usable response arrived.',
  )
  process.exitCode = 1
}