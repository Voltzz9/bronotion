'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/ui/header'
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { SessionWrapper } from '@/app/SessionProvider';

export default function NotesPage() {
  const [note, setNote] = useState(`# Rendered Markdown`)
  const [parsedNote, setParsedNote] = useState('')

  useEffect(() => {
    const sanitizedHtml = DOMPurify.sanitize(marked.parse(note));
    setParsedNote(sanitizedHtml);
  }, [note]);

  const setNoteContent = (content: string) => {
    setNote(content)
  }

  return (
    <SessionWrapper>
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header></Header>
      <main className="flex flex-grow pt-24">
        <div className="w-2/4 p-4 flex flex-col">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col">
            <textarea
              value={note}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow"
            />
          </div>
        </div>
        <div className="w-2/4 p-4 flex flex-col">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col">
            <div
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow overflow-auto markdown-style"
              dangerouslySetInnerHTML={{ __html: parsedNote }}
            />
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bronotion. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </SessionWrapper>
  );
}