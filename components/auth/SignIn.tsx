"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signIn, signInSocial } from '@/lib/actions/auth-actions'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lastMethod, setLastMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter();

  useEffect(() => {
    // Get the last used login method when component mounts
    const method = authClient.getLastUsedLoginMethod()
    setLastMethod(method)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await signIn(email, password)
      
      if (res && 'error' in res) {
        setError((res as any).error.message || 'Invalid email or password')
      } else if (res && res.redirect && res.user) {
        // Redirect to dashboard (verification guard will handle access control)
        router.push("/dashboard")
      } else {
        setError('Invalid email or password')
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInSocial('google')
    } catch (error) {
      console.error('Google sign in error:', error)
      setError('Failed to sign in with Google. Please try again.')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In Button */}
          <div className="relative">
            <Button 
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 relative"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
              {lastMethod === "google" && (
                <Badge variant="secondary" className="ml-2 text-sm absolute top-[100%] right-0 translate-y-[-50%]">
                  Last used
                </Badge>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              variant="outline"
              className="w-full flex items-center justify-center gap-2 relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  {lastMethod === "email" && (
                    <Badge variant="secondary" className="ml-2 text-sm absolute top-[100%] right-0 translate-y-[-50%]">
                      Last used
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm pt-4">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SignIn
