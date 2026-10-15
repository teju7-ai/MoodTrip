import test from 'node:test'
import assert from 'node:assert/strict'
import { findDestination } from './places.mjs'

test('landmark search includes amenities and rejects weak locality matches', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.GEOAPIFY_API_KEY
  process.env.GEOAPIFY_API_KEY = 'test-key'
  let results = [{ formatted: 'Taj Mahal, Agra, India', lat: 27.175, lon: 78.042, rank: { confidence: 1 } }]
  globalThis.fetch = async (url) => {
    assert.equal(url.searchParams.has('type'), false)
    assert.equal(url.searchParams.get('text'), 'taj mahal')
    return { ok: true, json: async () => ({ results }) }
  }
  try {
    const result = await findDestination('taj mahal')
    assert.equal(result.name, 'Taj Mahal, Agra, India')
    assert.equal(result.latitude, 27.175)
    results = [{ formatted: 'Mahal Kalan, Punjab, India', lat: 30.529, lon: 75.565, rank: { confidence: 0.375, match_type: 'full_match' } }]
    await assert.rejects(findDestination('taj mahal'), /uncertain/)
    results[0].rank = {}
    await assert.rejects(findDestination('taj mahal'), /uncertain/)
    results = []
    await assert.rejects(findDestination('taj mahal'), /not found/)
    results = [{ lat: null, lon: 78, rank: { confidence: 1 } }]
    await assert.rejects(findDestination('taj mahal'), /not found/)
  } finally {
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.GEOAPIFY_API_KEY
    else process.env.GEOAPIFY_API_KEY = originalKey
  }
})
