import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import {
  APOLLO_CREDENTIALS,
  DEMO_HOSPITAL_KEY,
} from '../lib/hospitalConfig'
import { ROUTES } from '../utils/routes'

// ── Reuse the exact same hero slides as LoginPage ──────────────────────────
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
      <img
        key={current}
        src={slides[current].src}
        alt={slides[current].caption}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 flex flex-col justify-between p-10">
        <div>
          <p className="mb-2 text-5xl font-bold text-white lg:text-6xl" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            NeuroAssist
          </p>
          <h1 className="text-2xl font-bold leading-snug text-white lg:text-3xl" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            Apollo Hospital<br />Receiving Portal
          </h1>
          <p className="mt-4 max-w-sm text-base text-white/80" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            Inter-hospital referral dashboard for incoming emergency stroke transfers.
          </p>
        </div>
        <p
          className="self-start text-sm font-semibold tracking-wide text-white/90"
          style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease-in-out', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
        >
          {slides[current].caption}
        </p>
      </div>
    </div>
  )
}

export function ApolloLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isValid = username.trim() === APOLLO_CREDENTIALS.username && password === APOLLO_CREDENTIALS.password
  const showError = submitted && !isValid

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmitted(true)
    if (isValid) {
      sessionStorage.setItem(DEMO_HOSPITAL_KEY, 'Apollo')
      navigate(ROUTES.apolloDashboard, { replace: true })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL — same hero slideshow as LoginPage */}
      <div className="hidden lg:block lg:w-3/5 xl:w-2/3">
        <HeroSlideshow />
      </div>

      {/* RIGHT PANEL — login card matching LoginPage exactly */}
      <div className="flex w-full items-center justify-center bg-white p-6 lg:w-2/5 xl:w-1/3">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-black bg-white shadow-sm">
              <ShieldCheck className="h-8 w-8 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl">Apollo Hospital Portal</CardTitle>
              <CardDescription className="mt-2 text-base text-black/70">
                Receiving Hospital Dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {showError && (
                <div className="rounded-xl border border-black bg-white px-4 py-3 text-sm font-medium text-black">
                  Invalid credentials. Use username: <strong>apollo</strong> and password: <strong>1234</strong>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="apollo-username">Username</Label>
                <Input
                  id="apollo-username"
                  type="text"
                  placeholder="apollo"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setSubmitted(false) }}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apollo-password">Password</Label>
                <div className="relative">
                  <Input
                    id="apollo-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setSubmitted(false) }}
                    onKeyDown={handleKeyDown}
                    className="pr-10"
                    autoComplete="current-password"
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
              </div>

              <Button type="submit" className="w-full">
                Sign In to Apollo Portal
              </Button>

              <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-3 text-center text-xs text-steel-500">
                Demo credentials — Username: <strong className="text-steel-900">apollo</strong> · Password: <strong className="text-steel-900">1234</strong>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
