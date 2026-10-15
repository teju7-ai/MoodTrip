import test from 'node:test'
import assert from 'node:assert/strict'
import { readDestination, signDestination } from './destinationSelection.mjs'

test('selected destinations are signed and tampering is rejected', () => {
  const previousKey = process.env.GEOAPIFY_API_KEY
  process.env.GEOAPIFY_API_KEY = 'test-key'
  try {
    const location = {
      name: 'Taj Mahal, Agra, India',
      latitude: 27.175,
      longitude: 78.042,
      country: 'India',
      countryCode: 'in',
    }
    const token = signDestination(location)
    assert.deepEqual(readDestination(token), location)
    assert.throws(() => readDestination(`${token.slice(0, -1)}x`), {
      status: 400,
    })
    assert.throws(() => readDestination('invalid'), { status: 400 })
  } finally {
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY
    else process.env.GEOAPIFY_API_KEY = previousKey
  }
})
