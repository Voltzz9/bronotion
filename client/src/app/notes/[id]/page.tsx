import { SessionWrapper } from "@/app/SessionProvider";
import Note from "./notes"

export default function NotesPage({ params }: { params: { id: string } }) {
  return (
    <SessionWrapper>
      <Note id={params.id} />
    </SessionWrapper>
  );
}