import Link from 'next/link'
import { handleSignOut } from "@/app/server/serverActions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const AuthButtons = () => {


  return (
    <div tabIndex={0} className="space-y-2">
      <Link href="/profile">
        <Button className='w-full'>
          View Profile
        </Button>
      </Link>
      
      <form action={handleSignOut}>
        <Button className='w-full' type="submit" >
          Sign out
        </Button>
      </form>
    </div>
  )
}

export default AuthButtons