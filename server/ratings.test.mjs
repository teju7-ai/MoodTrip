import test from 'node:test'
import assert from 'node:assert/strict'
import { supabase } from './supabase.mjs'
import { hashFeedbackToken } from './planStore.mjs'
import { saveRating, getSavedRating } from './ratings.mjs'

test('written feedback lifecycle and access validation', async () => {
  const originalFrom = supabase.from
  const feedbackToken = 'a'.repeat(64)
  const itineraryId = '11111111-1111-4111-8111-111111111111'
  const access = { itineraryId, feedbackToken }
  let row = null
  let writes = 0
  supabase.from = (table) => {
    const query = {
      select() { return this },
      eq() { return this },
      async maybeSingle() {
        return { data: table === 'itineraries' ? { feedback_token_hash: hashFeedbackToken(feedbackToken) } : row }
      },
      upsert(payload) {
        writes++
        row = { comment: '', ...row, ...payload }
        return this
      },
      async single() { return { data: row } },
    }
    return query
  }
  try {
    assert.deepEqual(await getSavedRating(access), { rating: null, comment: '' })
    assert.deepEqual(await saveRating({ ...access, rating: 5, comment: '  Great pace!  ' }), { rating: 5, comment: 'Great pace!' })
    assert.deepEqual(await getSavedRating(access), { rating: 5, comment: 'Great pace!' })
    assert.deepEqual(await saveRating({ ...access, rating: 4 }), { rating: 4, comment: 'Great pace!' })
    assert.deepEqual(await saveRating({ ...access, rating: 4, comment: 'More food stops' }), { rating: 4, comment: 'More food stops' })
    assert.deepEqual(await saveRating({ ...access, rating: 4, comment: '' }), { rating: 4, comment: '' })
    await saveRating({ ...access, rating: 4, comment: 'x'.repeat(1000) })
    const before = writes
    for (const comment of ['x'.repeat(1001), null, 123, {}]) {
      await assert.rejects(saveRating({ ...access, rating: 4, comment }), { status: 400 })
    }
    await assert.rejects(saveRating({ ...access, rating: 0, comment: 'Hello' }), { status: 400 })
    await assert.rejects(saveRating({ ...access, feedbackToken: 'b'.repeat(64), rating: 4, comment: 'Hello' }), { status: 403 })
    await assert.rejects(getSavedRating({ ...access, feedbackToken: 'b'.repeat(64) }), { status: 403 })
    assert.equal(writes, before)
  } finally {
    supabase.from = originalFrom
  }
})
