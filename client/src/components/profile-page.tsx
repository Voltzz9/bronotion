"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import UserIconUpdate from "@/components/user-icon-update"
import { ChangePasswordForm } from "./change-password"
import { DeleteAccountButton } from "./delete-account"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"

const URL = process.env.NEXT_PUBLIC_API_URL

async function getUserProfile(userId: string) {
  try {
    const response = await fetch(`${URL}users/${userId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const user = await response.json()
    return {
      name: user.username,
      email: user.email,
      image: user.image
    }
  } catch (error) {
    console.error('Error retrieving user:', error)
    throw new Error('Failed to fetch user profile')
  }
}

interface UserProfile {
  name: string
  email: string
  image: string
}

function AccountDetailsForm({ profile, onUpdateProfile }: { profile: UserProfile, onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void }) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateProfile({ name, email })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Username</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button type="submit">Update Details</Button>
    </form>
  )
}

function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account')

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        const userProfile = await getUserProfile(session.user.id)
        setProfile(userProfile)
      }
    }
    fetchUserProfile()
  }, [session])

  const handleUpdateImage = async (croppedImage: Blob) => {
    try {
      const formData = new FormData()
      formData.append('image', croppedImage)
      if (!session?.user?.id) {
        throw new Error('User ID is not available')
      }
      const response = await fetch(`${URL}users/${session.user.id}/update-image`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const updatedProfile = await getUserProfile(session.user.id)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile image:', error)
    }
  }

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User ID is not available')
      }
      const response = await fetch(`${URL}users/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const newProfile = await getUserProfile(session.user.id)
      setProfile(newProfile)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-6">
      <div className="flex gap-6 w-full max-w-7xl">
        <div className="w-64">
          <Card className="w-full h-fit">
            <CardContent className="p-4">
              <nav className="flex flex-col space-y-1">
                <Button
                  variant={activeTab === "account" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("account")}
                >
                  Account Details
                </Button>
                <Button
                  variant={activeTab === "password" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("password")}
                >
                  Change Password
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 max-w-3xl">
          <CardHeader>
            <UserIconUpdate
              currentImageUrl={profile.image}
              username={profile.name}
              onUpdateImage={handleUpdateImage}
            />
            <CardTitle className="text-2xl font-bold text-secondary mt-4">{profile.name}</CardTitle>
            <p className="text-gray-600 mt-2">{profile.email}</p>
          </CardHeader>
          <CardContent>
            {activeTab === "account" && (
              <>
                <AccountDetailsForm profile={profile} onUpdateProfile={handleUpdateProfile} />
                <div className="mt-6">
                  <DeleteAccountButton />
                </div>
              </>
            )}
            {activeTab === "password" && <ChangePasswordForm />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage