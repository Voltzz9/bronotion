import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/app/server/serverActions";

export default function SignOutButton() {
    return (
        <form action={handleSignOut}>
        <Button type="submit">Sign out</Button>
        </form>
    );
    }