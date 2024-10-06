'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useSession } from "next-auth/react";

const URL = process.env.NEXT_PUBLIC_API_URL;

async function deleteAccount(userId: string) {
  console.log('Deleting account')
  try {
    const response = await fetch(`${URL}users/${userId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log('Account deleted')
    // Optional: redirect to another page or logout
  } catch (error) {
    console.error('Error deleting account:', error)
    throw new Error('Failed to delete account')
  }
}

export function DeleteAccountButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => userId && deleteAccount(userId)}>Delete Account</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
