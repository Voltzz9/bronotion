"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import UserIconUpdate from "@/components/user-icon-update"
import { ChangePasswordForm } from "./change-password"
import { DeleteAccountButton } from "./delete-account"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { LogOut } from "lucide-react"
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

function AccountDetailsForm({ profile, onUpdateProfile, onChange }: { profile: UserProfile, onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void, onChange: (hasChanges: boolean) => void }) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [newImage, setNewImage] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const changes = name !== profile.name || email !== profile.email || newImage !== null
    setHasChanges(changes)
    onChange(changes)
  }, [name, email, newImage, profile, onChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedProfile: Partial<UserProfile> = { name, email }
    if (newImage) {
      updatedProfile.image = newImage
    }
    onUpdateProfile(updatedProfile)
  }

  const handleImageUpdate = (croppedImageUrl: string) => {
    setNewImage(croppedImageUrl)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === 'name') {
      setName(e.target.value)
    } else if (e.target.id === 'email') {
      setEmail(e.target.value)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UserIconUpdate
        currentImageUrl={newImage || profile.image}
        username={name}
        onUpdateImage={handleImageUpdate}
      />
      <div>
        <Label htmlFor="name">Username</Label>
        <Input id="name" value={name} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={handleInputChange} />
      </div>
      <Button type="submit" disabled={!hasChanges}>Update Details</Button>
    </form>
  )
}

function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account')
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchUserProfile = useCallback(async () => {
    if (session?.user?.id) {
      const userProfile = await getUserProfile(session.user.id)
      setProfile(userProfile)
    }
  }, [session])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User ID is not available')
      }
  
      const formData = new FormData();
      formData.append('name', updatedProfile.name || '');
      formData.append('email', updatedProfile.email || '');
      
      if (updatedProfile.image) {
        // Convert base64 to blob
        const response = await fetch(updatedProfile.image);
        const blob = await response.blob();
        formData.append('image', blob, 'profile-image.jpg');
      }
  
      const response = await fetch(`${URL}users/${session.user.id}`, {
        method: 'POST',
        body: formData,
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      await fetchUserProfile()
      setHasUnsavedChanges(false)
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        duration: 3000,
        variant: "destructive",
      })
    }
  }

  const handleExit = () => {
    if (hasUnsavedChanges) {
      setIsExitDialogOpen(true)
    } else {
      router.push('/home')
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

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
                  className={`justify-start ${activeTab === "account" ? "" : "hover:bg-slate-200 hover:text-black"}`}
                  onClick={() => setActiveTab("account")}
                >
                  Account Details
                </Button>
                <Button
                  variant={activeTab === "password" ? "default" : "ghost"}
                  className={`justify-start ${activeTab === "password" ? "" : "hover:bg-slate-200 hover:text-black"}`}
                  onClick={() => setActiveTab("password")}
                >
                  Change Password
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-red-500 hover:text-white"
                  onClick={handleExit}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-secondary">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "account" && (
              <>
                <AccountDetailsForm 
                  profile={profile} 
                  onUpdateProfile={handleUpdateProfile}
                  onChange={setHasUnsavedChanges}
                />
                <div className="mt-6">
                  <DeleteAccountButton />
                </div>
              </>
            )}
            {activeTab === "password" && <ChangePasswordForm />}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/home')}>Exit Without Saving</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}

export default ProfilePage