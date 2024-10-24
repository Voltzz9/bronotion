import LoginCard from "@/components/ui/login";
import { SessionWrapper } from "@/app/SessionProvider";

export default function LoginPage() {
  return (
    <SessionWrapper>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md px-4">
        <LoginCard />
      </div>
    </div>
    </SessionWrapper>
  );
}