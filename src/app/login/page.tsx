'use client'

import React, { useState } from 'react'
import Link from 'next/link'    
import exp from 'constants'

export default function LoginPage() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        alert(`Email: ${email}, Password: ${password}`)
    }
    
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
                CollabNotes
            </Link>
            <div className="space-x-4">
                <Link href="/features" className="text-gray-600 hover:text-blue-600">Features</Link>
                <Link href="/login" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Login</Link>
            </div>
            </nav>
        </header>
    
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 border-b">
                <h1 className="text-2xl font-bold">Login</h1>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                <label htmlFor="email" className="block text-gray-600">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={handleEmailChange} 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                />
                </div>
                <div>
                <label htmlFor="password" className="block text-gray-600">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    value={password} 
                    onChange={handlePasswordChange} 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                />
                </div>
                <div>
                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded">
                    Login
                </button>
                </div>
            </form>
            </div>
        </main>

        <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto px-4 text-center">
            &copy; 2023 CollabNotes. All rights reserved.
            </div>
        </footer>
        </div>
    )

}