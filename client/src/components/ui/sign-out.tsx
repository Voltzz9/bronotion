import { handleSignOut } from "@/app/server/serverActions";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

const SignOutButton = () => {
    return (
        <form action={handleSignOut}>
            <button 
                type="submit" 
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                    "focus:bg-accent focus:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                )}
            >
                Sign out
            </button>
        </form>
    );
};

export default SignOutButton;
