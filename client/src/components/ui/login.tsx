'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/app/hooks/AuthContext';
import { config } from 'dotenv';
config();

const URL = process.env.NEXT_PUBLIC_API_URL;

export default function Component() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const initialIsLogin = searchParams.get('mode') !== 'signup';
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if user is already authenticated
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated]);

  // Detect autofill
  useEffect(() => {
    if (emailRef.current && passwordRef.current) {
      // Capture the autofill values after the component mounts
      setEmail(emailRef.current.value);
      setPassword(passwordRef.current.value);
    }
  }, [emailRef, passwordRef]); // Run this effect after refs are assigned

  const toggleForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300); // Match this with the CSS transition duration
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Send login data to your API
      const response = await fetch(URL+'/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      console.log(result);

      if (response.ok) {
        // TODO update auth context
        router.push('/home');
      } else {
        // TODO Handle errors like invalid credentials
        console.error(result.message);
      }
    } catch (error) {
      console.error('An error occurred during login', error);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    try {
      // Send signup data to your API
      const response = await fetch(URL+'/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const result = await response.json();

      console.log(result);

      if (response.ok) {
        // TODO update auth context
        router.push('/home');
      } else {
        // Handle errors like email already registered
        console.error(result.message);
      }
    } catch (error) {
      console.error('An error occurred during signup', error);
    }
  };

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
      <CardContent>
        <form 
          onSubmit={isLogin ? handleLogin : handleSignup} 
          className={`space-y-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="bill@example.com" 
              required 
              value={email} 
              ref={emailRef} // Attach ref for autofill detection
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input 
                id="username" 
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
              type="password" 
              required 
              value={password} 
              ref={passwordRef} // Attach ref for autofill detection
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>
        <div className="text-center text-secondary">
          <Button variant="link" onClick={toggleForm}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}