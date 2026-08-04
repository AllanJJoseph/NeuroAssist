/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type StrokeOnsetContextValue = {
  strokeOnsetTime: string
  setStrokeOnsetTime: (time: string) => void
  clearStrokeOnset: () => void
}

const StrokeOnsetContext = createContext<StrokeOnsetContextValue | null>(null)

export function StrokeOnsetProvider({ children }: { children: ReactNode }) {
  const [strokeOnsetTime, setTime] = useState<string>('')

  const setStrokeOnsetTime = useCallback((time: string) => {
    setTime(time)
  }, [])

  const clearStrokeOnset = useCallback(() => {
    setTime('')
  }, [])

  return (
    <StrokeOnsetContext.Provider value={{ strokeOnsetTime, setStrokeOnsetTime, clearStrokeOnset }}>
      {children}
    </StrokeOnsetContext.Provider>
  )
}

export function useStrokeOnset() {
  const context = useContext(StrokeOnsetContext)
  if (!context) {
    throw new Error('useStrokeOnset must be used within StrokeOnsetProvider')
  }
  return context
}
