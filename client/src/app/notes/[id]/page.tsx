import { SessionWrapper } from "@/app/SessionProvider";
import Note from "./notes"

export default function NotesPage() {
  return (
    <SessionWrapper>
      <Note />
    </SessionWrapper>
  );
}