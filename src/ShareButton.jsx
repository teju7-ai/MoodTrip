import { useEffect, useRef, useState } from 'react'
import { Share2, Copy } from 'lucide-react'
import { createItineraryShareLink } from './api.js'

export default function ShareButton({ plan }) {
  const [shareUrl, setShareUrl] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const controllerRef = useRef(null)

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  if (plan.isDemo || !plan.feedbackToken) {
    return null
  }

  async function handleShare() {
    setError('')
    setMessage('')

    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setMessage('Link copied!')
      } catch {
        setMessage('Select the link below and press Ctrl + C to copy it.')
      }

      return
    }

    if (controllerRef.current) return

    const controller = new AbortController()
    controllerRef.current = controller
    setCreating(true)

    try {
      const url = await createItineraryShareLink(
        plan,
        controller.signal,
      )

      if (controller.signal.aborted) return

      setShareUrl(url)
      setMessage('Your link is ready. Click Copy link.')
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError.message)
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null
      }

      if (!controller.signal.aborted) {
        setCreating(false)
      }
    }
  }

  return (
    <div className="print-hide mt-6">
      <button
        type="button"
        onClick={handleShare}
        disabled={creating}
        className="inline-flex items-center gap-2 rounded-full
          border-2 border-ink bg-paper px-6 py-3 font-bold
          disabled:cursor-wait disabled:opacity-50"
      >
        {shareUrl ? <Copy size={18} /> : <Share2 size={18} />}

        {creating
          ? 'Creating link…'
          : shareUrl
            ? 'Copy link'
            : 'Create share link'}
      </button>

      <p className="mt-3 text-sm">
        Anyone with the link can view this itinerary.
      </p>

      {shareUrl && (
        <div className="mt-4">
          <label
            htmlFor="share-url"
            className="mb-2 block text-sm font-bold"
          >
            Your share link
          </label>

          <input
            id="share-url"
            type="text"
            readOnly
            value={shareUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full rounded-xl border-2 border-ink
              bg-paper px-4 py-3 text-sm"
          />
        </div>
      )}

      <p role="status" className="mt-3 text-sm font-bold">
        {message}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border-2 border-ink
            bg-paper p-3 text-sm"
        >
          {error}
        </p>
      )}
    </div>
  )
}