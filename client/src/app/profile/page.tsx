import { redirect } from "next/navigation"
import { auth } from "@/../auth"
import UserIconUpdate from "@/components/user-icon-update"
import { ChangePasswordForm } from "./change-password"
import { DeleteAccountButton } from "./delete-account"
import { Button } from "@/components/ui/button"

const URL = process.env.NEXT_PUBLIC_API_URL

async function getUserProfile(userId: string) {
  console.log('getUserProfile:', userId)
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
    console.log('getUserProfile error:', URL, ' ', userId)
    console.error('Error retrieving user:', error)
    throw new Error('Failed to fetch user profile')
  }
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session) {
    redirect("/auth/signin")
  }
  if (!session?.user?.id) {
    throw new Error('User ID is not available')
  }
  const userProfile = await getUserProfile(session.user.id)

  return <ProfilePageClient userProfile={userProfile} session={session} />
}

interface UserProfile {
  name: string
  email: string
  image: string
}

import { Session } from "@auth/core/types"
import { useState } from "react"

function ProfilePageClient({ userProfile, session }: { userProfile: UserProfile; session: Session }) {
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
      // Refresh the user profile after updating the image
      const updatedProfile = await getUserProfile(session.user.id)
      // Update the profile state with the new image URL
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile image:', error)
    }
  }

  const [profile, setProfile] = useState<UserProfile>(userProfile)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-6 mb-4">
          <UserIconUpdate
            currentImageUrl={userProfile.image}
            username={userProfile.name}
            onUpdateImage={handleUpdateImage}
          />
          <div>
            <h2 className="text-xl font-medium">{userProfile.name}</h2>
            <p className="text-gray-600">{userProfile.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">Change Password</h2>
        <ChangePasswordForm />
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">Delete Account</h2>
        <DeleteAccountButton />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  )
}