import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { ROUTES } from '../utils/routes'

export function CreateAccountPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Validation
  const isNameValid = fullName.trim().length > 0
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid = password.length >= 4
  const isConfirmPasswordValid = confirmPassword === password && confirmPassword.length >= 4

  const hasNameError = submitted && !isNameValid
  const hasEmailError = email.length > 0 && !isEmailValid
  const hasPasswordError = password.length > 0 && !isPasswordValid
  const hasConfirmPasswordError = confirmPassword.length > 0 && !isConfirmPasswordValid

  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmitted(true)
    if (isFormValid) {
      navigate(ROUTES.login)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-black bg-white shadow-sm">
            <UserPlus className="h-8 w-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription className="mt-2 text-base text-black/70">
              Register to access the NeuroAssist clinical system
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Dr. Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={hasNameError ? 'border-red-500 focus:ring-red-500/20' : ''}
              />
              {hasNameError && (
                <p className="text-xs text-red-600">Full name is required.</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email address</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="clinician@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={hasEmailError ? 'border-red-500 focus:ring-red-500/20' : ''}
              />
              {hasEmailError && (
                <p className="text-xs text-red-600">Please enter a valid email address.</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={hasConfirmPasswordError ? 'border-red-500 focus:ring-red-500/20 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {hasConfirmPasswordError && (
                <p className="text-xs text-red-600">Passwords do not match.</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate(ROUTES.login)}
            >
              Back to Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
