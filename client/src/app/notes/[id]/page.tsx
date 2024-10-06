import { SessionWrapper } from "@/app/SessionProvider";
import Note from "./notes"
import { auth } from "@/../auth";
import { redirect } from 'next/navigation';

export default async function NotesPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }
  return (
    <SessionWrapper>
      <Note />
    </SessionWrapper>
  );
}