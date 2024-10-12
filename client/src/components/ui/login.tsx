'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import GitHubSignInForm from './git-hub'
import GoogleSignInButton from './google'

export default function Component() {
  const [isLogin, setIsLogin] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (emailRef.current && passwordRef.current) {
      setEmail(emailRef.current.value)
      setPassword(passwordRef.current.value)
    }
  }, [emailRef, passwordRef])

  const toggleForm = () => {
    setIsAnimating(true)
    setError('')
    setShowForgotPassword(false)
    setTimeout(() => {
      setIsLogin(!isLogin)
      setIsAnimating(false)
    }, 300)
  }

  const handleForgotPassword = async () => {
    router.push('/forgot-password')

  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        remember,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        setShowForgotPassword(true)
      } else {
        router.push('/home')
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${URL}users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password,
          auth_method: 'credentials',
        }),
      })

      const result = await response.json()

      if (response.ok) {
        const signInResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })
        if (signInResult?.error) {
          setError('Account created, but unable to log in. Please try logging in manually.')
        } else {
          router.push('/home')
        }
      } else {
        setError(result.error || 'An error occurred during signup. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-sm overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-secondary">
          {isLogin ? 'Login' : 'Sign Up'}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? 'Enter your email and password to start notetaking!'
            : 'Create a new account by entering your details'}
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {error && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className={`space-y-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="bill@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              ref={emailRef}
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ref={passwordRef}
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

            {isLogin && (
              <div className="flex justify-center items-center space-x-2">
              <Input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4"
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
              </div>
            )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        {showForgotPassword && (
            <div className="text-center">
            <a 
              className="text-blue-500 hover:underline text-sm cursor-pointer"
              onClick={handleForgotPassword}
            >
              Have you forgotten your password?
            </a>
            </div>
        )}
        <GitHubSignInForm />
        <GoogleSignInButton />
        <div className="text-center text-secondary">
          <Button variant="link" onClick={toggleForm}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}