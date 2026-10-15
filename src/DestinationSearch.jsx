import { useEffect, useRef, useState } from 'react'
import { searchDestinations } from './api.js'

export default function DestinationSearch({ selected, onSelect }) {
  const [query, setQuery] = useState(selected?.name ?? '')
  const [result, setResult] = useState({ query: '', items: [], status: 'idle' })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [retry, setRetry] = useState(0)
  const request = useRef(null)
  const text = query.trim()
  const needsSearch = !selected && text.length >= 2
  const current = result.query === text
  const items = current ? result.items : []
  const loading = needsSearch && (!current || result.status === 'loading')
  const expanded = open && needsSearch

  useEffect(() => {
    if (!needsSearch) return
    const controller = new AbortController()
    request.current = controller
    const timer = setTimeout(async () => {
      setResult({ query: text, items: [], status: 'loading' })
      try {
        const matches = await searchDestinations(text, controller.signal)
        if (!controller.signal.aborted) setResult({ query: text, items: matches, status: 'ready' })
      } catch {
        if (!controller.signal.aborted) setResult({ query: text, items: [], status: 'error' })
      }
    }, 350)
    return () => { clearTimeout(timer); controller.abort() }
  }, [text, needsSearch, retry])

  function choose(place) {
    request.current?.abort()
    setQuery(place.name)
    onSelect(place)
    setOpen(false)
    setActive(-1)
  }

  return (
    <div>
      <label htmlFor="destination" className="mb-3 block font-bold">Your destination</label>
      <input
        id="destination" role="combobox" aria-autocomplete="list"
        aria-expanded={expanded} aria-controls="destination-options"
        aria-activedescendant={expanded && active >= 0 && items[active] ? `destination-option-${active}` : undefined}
        aria-describedby="destination-help destination-status"
        autoComplete="off" maxLength={80} value={query}
        placeholder="Search a city or landmark, like Taj Mahal"
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        onChange={(event) => {
          request.current?.abort()
          setQuery(event.target.value)
          onSelect(null)
          setResult({ query: '', items: [], status: 'idle' })
          setActive(-1)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            if (items.length) setActive((index) => event.key === 'ArrowDown'
              ? (index + 1) % items.length : (index <= 0 ? items.length - 1 : index - 1))
          } else if (event.key === 'Enter' && !selected) {
            event.preventDefault()
            if (expanded && items[active]) choose(items[active])
          } else if (event.key === 'Escape') {
            event.preventDefault()
            setOpen(false)
            setActive(-1)
          }
        }}
        className="w-full rounded-2xl border-2 border-ink bg-paper px-5 py-4 text-lg"
      />
      {expanded && items.length > 0 && (
        <ul id="destination-options" role="listbox" aria-label="Destination suggestions"
          className="mt-2 overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[4px_4px_0_#171714]">
          {items.map((place, index) => (
            <li key={place.token} role="presentation">
              <button type="button" role="option" id={`destination-option-${index}`}
                aria-selected={index === active} tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)} onClick={() => choose(place)}
                className={`w-full border-b border-ink/15 px-4 py-3 text-left ${index === active ? 'bg-lime' : 'hover:bg-paper'}`}>
                <span className="block font-bold">{place.name}</span>
                <span className="block text-sm leading-relaxed text-ink/75">{place.label}</span>
                <span className="text-xs capitalize text-ink/60">{place.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p id="destination-help" className="mt-3 text-sm text-ink/65">
        Type at least 2 characters, then choose a place. Use ↑ ↓ and Enter, or tap a suggestion.
      </p>
      <p id="destination-status" role="status" aria-live="polite" className="mt-2 text-sm">
        {selected ? `Selected: ${selected.label}` : loading ? 'Searching destinations…'
          : current && result.status === 'error' ? 'Search is unavailable. Try again or edit your search.'
            : needsSearch && current && result.status === 'ready' ? (items.length ? `${items.length} suggestions. Choose the location you mean.` : 'No matches. Try adding the city or country.')
              : 'Select a suggestion to continue.'}
      </p>
      {needsSearch && current && result.status === 'error' && (
        <button type="button" className="mt-2 font-bold underline" onClick={() => { setRetry((value) => value + 1); setOpen(true) }}>Try search again</button>
      )}
      <p className="mt-3 text-xs text-ink/60">Destination search powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer" className="underline">Geoapify</a>.</p>
    </div>
  )
}
