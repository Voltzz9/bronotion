'use client'

import React, { useState } from 'react'
import Header from '@/components/ui/header'
import Login from '@/components/login'

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
        
        <Header />
    
        <main className="flex-grow container mx-auto px-4 py-8">
            <Login />
        </main>

        <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto px-4 text-center">
            &copy; 2023 CollabNotes. All rights reserved.
            </div>
        </footer>
        </div>
    )

}