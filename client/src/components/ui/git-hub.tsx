import { Button } from "@/components/ui/button";
import { handleGithubSignIn } from "@/app/server/serverActions";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function GitHubSignInForm() {
  return (
    <form action={handleGithubSignIn}>
      <Button type="submit" className="w-full flex items-center justify-center space-x-2">
        <GitHubLogoIcon className="w-5 h-5" /> {/* Adjust size if needed */}
        <span>Sign in with GitHub</span>
      </Button>
    </form>
  );
}
