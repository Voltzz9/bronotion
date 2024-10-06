'use client'

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import React from "react";
const URL = process.env.NEXT_PUBLIC_API_URL;

async function changePassword(userId: string, formData: FormData) {
  try {
    const response = await fetch(`${URL}users/${userId}/change_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

async function getUserAuthMethods(userId: string) {
  try {
    const response = await fetch(`${URL}users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const user = await response.json();
    return user.auth_methods;
  } catch (error) {
    console.error('Error retrieving user auth methods:', error);
    throw error;
  }
}

export function ChangePasswordForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [authMethods, setAuthMethods] = useState<{ isManual: boolean; isOAuth: boolean }[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      getUserAuthMethods(session.user.id).then(setAuthMethods).catch(console.error);
    }
  }, [session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!session?.user?.id) {
      setError('User ID is not available');
      return;
    }

    try {
      const result = await changePassword(session.user.id, formData);
      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
        duration: 3000,
      });
      formRef.current?.reset();
      // Refetch user auth methods to update the form state
      const updatedAuthMethods = await getUserAuthMethods(session.user.id);
      setAuthMethods(updatedAuthMethods);
    } catch (error) {
      setError((error as Error).message);
      toast({
        title: "Error",
        description: (error as Error).message,
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const hasManualAuth = authMethods && authMethods.some(method => method.isManual);

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="space-y-4">
        {hasManualAuth ? (
          <>
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input type="password" id="currentPassword" name="currentPassword" required />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input type="password" id="newPassword" name="newPassword" required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input type="password" id="confirmPassword" name="confirmPassword" required />
            </div>
          </>
        ) : (
          <p>You do not have a password set. Please create a new password.</p>
        )}
        
        {!hasManualAuth && (
          <>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input type="password" id="newPassword" name="newPassword" required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input type="password" id="confirmPassword" name="confirmPassword" required />
            </div>
          </>
        )}
        
        {error && <p className="text-red-500">{error}</p>}
        
        <Button type="submit">Change Password</Button>
      </div>
    </form>
  );
}