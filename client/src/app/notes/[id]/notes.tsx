'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/ui/header'
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FloatingCollaborators } from '@/components/floating-collaborators';
import useNoteId from '@/app/hooks/useNoteId';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession();
  const [note, setNote] = useState('');
  const [parsedNote, setParsedNote] = useState(`# Rendered Markdown`);
  const noteId = useNoteId();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [userName, setUsername] = useState("");

  useEffect(() => {
    console.log("Connecting to:", URL);

    const newSocket = io(URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && noteId) {
      socket.emit('join-note', noteId);

      socket.on('note-updated', (updatedContent) => {
        setNote(updatedContent);
      });

      socket.on('update-collaborators-rec', () => {
        console.log("TODO call function");
      })

      return () => {
        socket.off('note-updated');
      };
    }
  }, [socket, noteId]);

  const sendAddCollabUpdate = () => {
    if (socket) {
      console.log("test")
      socket.emit('update-collaborators-send', (noteId));
    }
  }

  useEffect(() => {
    const parseMarkdown = async () => {
      const parsedMarkdown = await marked.parse(note);
      const sanitizedHtml = DOMPurify.sanitize(parsedMarkdown);
      setParsedNote(sanitizedHtml);
    };
    parseMarkdown();
  }, [note]);

  const setNoteContent = (content: string) => {
    setNote(content);

    if (timeoutId) {
      clearTimeout(timeoutId); // Clear the previous timeout
    }

    const newTimeoutId = setTimeout(() => {
      if (socket && noteId) {
        socket.emit('update-note', { noteId, content });
        saveNote(); // Call the save function
      }
    }, 2000); // Debounce time of 2 seconds

    setTimeoutId(newTimeoutId);
  };

  const saveNote = async () => {
    try {
      const response = await fetch(URL + `notes/${noteId}`, {
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
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        return;
      } else {
        // Fetch Username
        const resp = await fetch(URL + `users/` + session.user.id);
        const data = await resp.json();
        if (!resp.ok) {
          console.error('Failed to fetch User Info');
          return;
        }
        console.log("Logged in username:", data.username);
        setUsername(data.username);
      }

      if (noteId) {
        const fetchNote = async () => {
          try {
            const response = await fetch(URL + `notes/${noteId}`);
            if (response.status === 404) {
              router.push('/404');
              return;
            }
            const data: Note = await response.json();
            setNote(data.content);
          } catch (error) {
            console.error('Error fetching note:', error);
          }
        };
        fetchNote();
      }
    };

    fetchData();
  }, [noteId, router, session?.user?.id]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCollaboratorAdded={sendAddCollabUpdate} />
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
      <FloatingCollaborators current_user={userName} />
      <footer className="bg-gray-800 text-white py-4">

        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bronotion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}