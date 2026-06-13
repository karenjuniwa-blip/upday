import { useState, useEffect } from 'react'

/** Returns a live Date that updates every `intervalMs` milliseconds */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}
