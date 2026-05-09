import { useEffect, useRef, useState } from "react"

export function useTypewriter(fullText: string, charsPerFrame = 3) {
  const [displayed, setDisplayed] = useState("")
  const displayedRef = useRef("")
  const frameRef = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(frameRef.current)

    // Reset if text doesn't match current position (new message)
    if (!fullText.startsWith(displayedRef.current)) {
      displayedRef.current = ""
      setDisplayed("")
    }

    if (displayedRef.current.length >= fullText.length) return

    const tick = () => {
      const pending = fullText.length - displayedRef.current.length
      if (pending <= 0) return

      // Catch up faster when many chars are queued, smooth when nearly in sync
      const step = pending > 100 ? Math.ceil(pending / 8) : charsPerFrame
      const next = fullText.slice(0, displayedRef.current.length + step)
      displayedRef.current = next
      setDisplayed(next)

      if (displayedRef.current.length < fullText.length) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [fullText, charsPerFrame])

  return displayed
}
