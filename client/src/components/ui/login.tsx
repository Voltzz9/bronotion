'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import GitHubSignInForm from './git-hub';
import GoogleSignInButton from './google';

export default function Component() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (emailRef.current && passwordRef.current) {
      setEmail(emailRef.current.value);
      setPassword(passwordRef.current.value);
    }
  }, [emailRef, passwordRef]);

  const toggleForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.error('Login failed:', result.error);
      } else {
        router.push('/home');
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
      const response = await fetch('https://localhost:8080/create_user', {
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

      if (response.ok) {
        await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        router.push('/home');
      } else {
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
      <CardContent className={`space-y-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
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
          <Button 
            type="submit" 
            className="w-full"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        <GitHubSignInForm />
        <GoogleSignInButton />
        <div className="text-center text-secondary">
          <Button variant="link" onClick={toggleForm}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}