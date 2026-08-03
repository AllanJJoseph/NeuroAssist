import { useState, type ReactNode } from 'react'
import { AuthContext } from './auth-types'

const AUTH_KEY = 'neuroassist_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(AUTH_KEY) === 'true',
  )

  const login = () => {
    sessionStorage.setItem(AUTH_KEY, 'true')
    setIsAuthenticated(true)
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
