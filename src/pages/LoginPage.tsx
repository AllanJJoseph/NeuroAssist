import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/use-auth'
import { ROUTES } from '../utils/routes'

const slides = [
  { src: '/images/slide1.jpg', caption: 'Clinical imaging review' },
  { src: '/images/slide2.jpg', caption: 'Patient-centered care' },
  { src: '/images/slide3.jpg', caption: 'Secure clinician access' },
  { src: '/images/slide4.jpg', caption: 'AI-assisted stroke detection' },
  { src: '/images/slide5.jpg', caption: 'Advanced medical imaging' },
]

function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
        setFading(false)
      }, 500)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Slide image */}
      <img
        key={current}
        src={slides[current].src}
        alt={slides[current].caption}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Hero text */}
      <div className="absolute inset-0 flex flex-col justify-between p-10">
        <div>
          <p
            className="mb-2 text-5xl font-bold text-white lg:text-6xl"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            NeuroAssist
          </p>
          <h1
            className="text-2xl font-bold leading-snug text-white lg:text-3xl"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
          >
            Clinical Decision<br />Support Platform
          </h1>
          <p
            className="mt-4 max-w-sm text-base text-white/80"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
          >
            AI-assisted stroke screening for faster clinical decision making.
          </p>
        </div>

        {/* Caption */}
        <p
          className="self-start text-sm font-semibold tracking-wide text-white/90"
          style={{
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out',
            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          }}
        >
          {slides[current].caption}
        </p>
      </div>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
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
      login()
      navigate(ROUTES.home)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL — hero + slideshow */}
      <div className="hidden lg:block lg:w-3/5 xl:w-2/3">
        <HeroSlideshow />
      </div>

      {/* RIGHT PANEL — login card */}
      <div className="flex w-full items-center justify-center bg-white p-6 lg:w-2/5 xl:w-1/3">
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
    </div>
  )
}
