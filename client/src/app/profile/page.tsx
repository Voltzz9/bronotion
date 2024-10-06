import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { SessionWrapper } from "@/app/SessionProvider";
import ProfilePage from "../../components/profile-page";

export default async function Profile() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }
  return (
    <SessionWrapper>
      <ProfilePage />
    </SessionWrapper>
  );
}