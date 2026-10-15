import { createHmac, timingSafeEqual } from 'node:crypto'

function signature(payload) {
  const key = process.env.GEOAPIFY_API_KEY
  if (!key) throw new Error('Destination search is not configured.')
  return createHmac('sha256', key).update(`moodtrip-destination-v1:${payload}`).digest()
}

export function signDestination(location) {
  const payload = Buffer.from(JSON.stringify(location)).toString('base64url')
  return `${payload}.${signature(payload).toString('base64url')}`
}

export function readDestination(token) {
  try {
    if (typeof token !== 'string' || token.length > 4000) throw new Error()
    const [payload, mac, extra] = token.split('.')
    if (!payload || !mac || extra !== undefined) throw new Error()
    const supplied = Buffer.from(mac, 'base64url')
    const expected = signature(payload)
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new Error()
    const location = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (typeof location.name !== 'string' || !location.name ||
        !Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90 ||
        !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180) throw new Error()
    return location
  } catch {
    throw Object.assign(new Error('Please choose your destination again from the suggestions.'), { status: 400 })
  }
}
