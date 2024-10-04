'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/ui/header'
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FloatingCollaborators } from '@/components/floating-collaborators';
import useNoteId from '@/app/hooks/useNoteId';
import { Button } from '@/components/ui/button';

const URL = process.env.NEXT_PUBLIC_API_URL;

interface Note {
  note_id: number,
  title: string,
  content: string,
  tag_id: string,
  created_at: Date,
  updated_at: Date,
}

export default function Notes() {
  const [note, setNote] = useState('')
  const [parsedNote, setParsedNote] = useState(`# Rendered Markdown`)
  const noteId = useNoteId()

  useEffect(() => {
    const parseMarkdown = async () => {
      const parsedMarkdown = await marked.parse(note);
      const sanitizedHtml = DOMPurify.sanitize(parsedMarkdown);
      setParsedNote(sanitizedHtml);
    };
    parseMarkdown();
  }, [note]);

  const setNoteContent = (content: string) => {
    setNote(content)
  }

  const saveNote = async () => {
    try {
      const response = await fetch(URL+`notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: note }),
      });
      if (!response.ok) {
        throw new Error('Error saving note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }

  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        try {
          const response = await fetch(URL+`notes/${noteId}`);
          const data: Note = await response.json();
          setNote(data.content);  // Assuming the response has a 'content' field
        } catch (error) {
          console.error("Error fetching note:", error);
        }
      };

      fetchNote();
    }
  }, [noteId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex flex-grow pt-24">
        <div className="w-2/4 pb-4 pl-4 pr-2 flex flex-col">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col">
            <textarea
              value={note}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow"
            />
          </div>
        </div>
        <div className="w-2/4 pb-4 pl-2 pr-4 flex flex-col">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col">
            <div
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow overflow-auto markdown-style"
              dangerouslySetInnerHTML={{ __html: parsedNote }}
            />
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              saveNote();
            }}
          > Save </Button>
        </div>
      </main>
      <FloatingCollaborators />
      <footer className="bg-gray-800 text-white py-4">

        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bronotion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}