import Link from 'next/link'
import { handleSignOut } from "@/app/server/serverActions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react" // Import signOut from next-auth

const AuthButtons = () => {
  const buttonClasses = cn(
    "w-full relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
    "focus:bg-accent focus:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  )

  const handleLoginWithAnotherAccount = async () => {
    await signOut({ redirect: false }); // Sign out without redirecting
    window.location.href = '/auth/signin'; // Redirect to login page
  }

  return (
    <div className="space-y-2">
      <Link href="/profile">
        <Button className={buttonClasses}>
          View Profile
        </Button>
      </Link>
      
      <form action={handleSignOut}>
        <Button 
          type="submit" 
          className={buttonClasses}
        >
          Sign out
        </Button>
      </form>
      
      <Button className={buttonClasses} onClick={handleLoginWithAnotherAccount}>
        Login with Another Account
      </Button>
    </div>
  )
}

export default AuthButtons