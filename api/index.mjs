import app from '../server/app.mjs'

export default function handler(request, response) {
  // Restore the API path supplied by the Vercel rewrite before Express routes it.
  const url = new URL(request.url, 'http://localhost')
  const path = request.query?.__path ?? url.searchParams.get('__path')

  if (typeof path === 'string') {
    url.searchParams.delete('__path')
    const query = url.searchParams.toString()
    request.url = `/api/${path}${query ? `?${query}` : ''}`
  }

  return app(request, response)
}
