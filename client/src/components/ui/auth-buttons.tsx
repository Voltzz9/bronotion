import Link from 'next/link'
import { handleSignOut } from "@/app/server/serverActions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const AuthButtons = () => {

  const buttonClasses = cn(
    "w-full relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  )

  return (
    <div className="space-y-2">
      <Link href="/profile">
        <Button
          className={buttonClasses}
        >
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
    </div>
  )
}

export default AuthButtons