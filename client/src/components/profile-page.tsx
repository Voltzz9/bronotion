"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import UserIconUpdate from "@/components/user-icon-update";
import { ChangePasswordForm } from "./change-password";
import { DeleteAccountButton } from "./delete-account";
import { Button } from "@/components/ui/button";

const URL = process.env.NEXT_PUBLIC_API_URL;

async function getUserProfile(userId: string) {
  console.log('getUserProfile:', userId);
  try {
    const response = await fetch(`${URL}users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const user = await response.json();
    return {
      name: user.username,
      email: user.email,
      image: user.image
    };
  } catch (error) {
    console.log('getUserProfile error:', URL, ' ', userId);
    console.error('Error retrieving user:', error);
    throw new Error('Failed to fetch user profile');
  }
}

interface UserProfile {
  name: string;
  email: string;
  image: string;
}

function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);
      }
    };
    fetchUserProfile();
  }, [session]);

  const handleUpdateImage = async (croppedImage: Blob) => {
    try {
      const formData = new FormData();
      formData.append('image', croppedImage);
      if (!session?.user?.id) {
        throw new Error('User ID is not available');
      }
      const response = await fetch(`${URL}users/${session.user.id}/update-image`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Refresh the user profile after updating the image
      const updatedProfile = await getUserProfile(session.user.id);
      // Update the profile state with the new image URL
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow rounded-full p-8 w-96 text-center">
        <UserIconUpdate
          currentImageUrl={profile.image}
          username={profile.name}
          onUpdateImage={handleUpdateImage}
        />
        <h2 className="text-xl font-medium mt-4">{profile.name}</h2>
        <p className="text-gray-600 mt-2">{profile.email}</p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;