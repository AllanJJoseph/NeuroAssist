import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { ROUTES } from '../utils/routes'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid = password.length >= 4
  const isValid = isEmailValid && isPasswordValid

  const hasEmailError = email.length > 0 && !isEmailValid
  const hasPasswordError = password.length > 0 && !isPasswordValid
  const showInvalidCredentials = submitted && !isValid

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmitted(true)
    if (isValid) {
      navigate(ROUTES.home)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-black bg-white shadow-sm">
            <ShieldCheck className="h-8 w-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to NeuroAssist</CardTitle>
            <CardDescription className="mt-2 text-base text-black/70">
              Sign in to access the clinical decision support system
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {showInvalidCredentials && (
              <div className="rounded-xl border border-black bg-white px-4 py-3 text-sm font-medium text-black">
                Invalid credentials. Please check your email and password.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="clinician@hospital.org"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubmitted(false) }}
                onKeyDown={handleKeyDown}
                className={hasEmailError ? 'border-red-500 focus:ring-red-500/20' : ''}
              />
              {hasEmailError && (
                <p className="text-xs text-red-600">Please enter a valid email address.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium hover:underline text-black">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSubmitted(false) }}
                  onKeyDown={handleKeyDown}
                  className={hasPasswordError ? 'border-red-500 focus:ring-red-500/20 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {hasPasswordError && (
                <p className="text-xs text-red-600">Password must be at least 4 characters.</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-black text-black focus:ring-black accent-black"
              />
              <Label htmlFor="rememberMe" className="cursor-pointer font-normal">
                Remember me for 30 days
              </Label>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate(ROUTES.register)}
            >
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
