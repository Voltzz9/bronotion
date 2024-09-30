import { SessionWrapper } from "@/app/SessionProvider";
import  Notes  from "./notes"

export default function NotesPage() {
  return (
    <SessionWrapper>
        <Notes />
    </SessionWrapper>
  );
}