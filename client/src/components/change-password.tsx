'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

async function changePassword(formData: FormData) {
  // This is a placeholder. In a real app, you'd send this data to your server
  console.log('Changing password:', Object.fromEntries(formData))
}

export function ChangePasswordForm() {
  return (
    <form action={changePassword}>
      <div className="space-y-4">
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
        
        <Button type="submit">Change Password</Button>
      </div>
    </form>
  )
}