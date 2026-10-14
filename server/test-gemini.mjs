import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.log('Gemini key missing. Check your .env file.')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey })

try {
  console.log('Connecting to Gemini...')

  const result = await ai.interactions.create({
    model: 'gemini-3.6-flash',
    input: 'Reply with exactly: MoodTrip AI is connected!',
  })

  if (!result.output_text) {
    throw new Error('No text returned')
  }

  console.log(result.output_text)
} catch (error) {
  console.log('Gemini connection failed.')
  console.log('Error code:', error.status ?? error.code ?? 'unknown')
  console.log('Your API key has not been displayed.')
  process.exitCode = 1
}