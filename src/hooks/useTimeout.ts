import { useEffect, useRef } from 'react'

export function useTimeout(callback: () => void, delayMs: number) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => callbackRef.current(), delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [delayMs])
}
