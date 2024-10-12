"use client"

import React, { useEffect, useState, useRef } from 'react'
import Header from '@/components/ui/header'
import { marked } from 'marked'
import { markedEmoji } from "marked-emoji"
import { Octokit } from "@octokit/rest"
import DOMPurify from 'dompurify'
import { FloatingCollaborators } from '@/components/floating-collaborators'
import useNoteId from '@/app/hooks/useNoteId'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/hooks/useSocket'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

const URL = process.env.NEXT_PUBLIC_API_URL

interface Note {
  note_id: number
  title: string
  content: string
  tag_id: string
  created_at: Date
  updated_at: Date
}

export default function Notes() {
  const [userId, setUserId] = useState("")
  const { socket, joinNote, leaveNote, updateNote } = useSocket()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = useSession();
  const [note, setNote] = useState('');
  const [parsedNote, setParsedNote] = useState(`# Rendered Markdown`);
  const noteId = useNoteId();
  const router = useRouter();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const floatingCollaboratorsRef = useRef<{ fetchCollaborators: () => void } | null>(null);
  const { toast } = useToast();
  const octokit = new Octokit();

  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const res = await octokit.rest.emojis.get();
        const emojis = res.data;
        
        const options = {
          emojis,
          renderer: (token: { name: string; emoji: string }) => 
            `<img alt="${token.name}" src="${token.emoji}" class="inline-emoji" style="display: inline-block; height: 1em; width: 1em; margin: 0 .05em 0 .1em; vertical-align: -0.1em;">`
        };

        marked.use(markedEmoji(options));
      } catch (error) {
        console.error('Error fetching emojis:', error);
      }
    };

    fetchEmojis();
  }, []);

  useEffect(() => {
    if (socket && noteId && session?.user?.id) {
      joinNote(noteId, session.user.id)

      return () => {
        if (noteId && session?.user?.id) {
          leaveNote(noteId, session?.user?.id)
        }
      }
    }
  }, [socket, noteId, session?.user?.id, joinNote, leaveNote])

  useEffect(() => {
    if (socket) {
      const handleNoteUpdated = (updatedContent: string) => {
        setNote(updatedContent)
      }

      socket.on('note-updated', handleNoteUpdated)

      socket.on('update-collaborators-rec', () => {
        if (floatingCollaboratorsRef.current) {
          floatingCollaboratorsRef.current.fetchCollaborators();
        }
      })

      return () => {
        socket.off('note-updated', handleNoteUpdated)
      }
    }
  }, [socket])

  const sendAddCollabUpdate = () => {
    if (socket) {
      console.log("test")
      socket.emit('update-collaborators-send', (noteId));
    }
  }

  useEffect(() => {
    const parseMarkdown = async () => {
      const parsedMarkdown = await marked.parse(note)
      const sanitizedHtml = DOMPurify.sanitize(parsedMarkdown)
      setParsedNote(sanitizedHtml)
    }
    parseMarkdown()
  }, [note])

  const setNoteContent = (content: string) => {
    setNote(content)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      if (noteId) {
        updateNote(noteId, content)
        saveNoteContent(content)
      }
    }, 2000)

    setTimeoutId(newTimeoutId)
  }

  const saveNoteContent = async (content: string) => {
    try {
      const response = await fetch(`${URL}notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) {
        throw new Error('Error saving note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const saveNote = async () => {
    await saveNoteContent(note);
    toast({
      title: "Success",
      description: "Your note has been saved successfully.",
      duration: 3000,
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        return
      } else {
        const resp = await fetch(`${URL}users/${session.user.id}`)
        const data = await resp.json()
        if (!resp.ok) {
          console.error('Failed to fetch User Info')
          return
        }
        console.log("Logged in username:", data.username)
        setUserId(data.id)
      }

      if (noteId) {
        const fetchNote = async () => {
          try {
            const response = await fetch(`${URL}notes/${noteId}`)
            if (response.status === 404) {
              router.push('/404')
              return
            }
            const data: Note = await response.json()
            setNote(data.content)
          } catch (error) {
            console.error('Error fetching note:', error)
          }
        }
        fetchNote()
      }
    }

    fetchData()
  }, [noteId, router, session?.user?.id])

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight + 10;
    }
  }, [note]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCollaboratorAdded={sendAddCollabUpdate} />
      <main className="flex flex-grow pt-24">
        <div className="w-2/4 pb-4 pr-4 flex flex-col">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col h-full">
            <textarea
              value={note}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow"
              ref={textAreaRef}
            />
          </div>
        </div>
        <div className="w-2/4 pb-4 pl-4 flex flex-col">
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
          >
            Save
          </Button>
        </div>
      </main>
      <FloatingCollaborators current_userId={userId} ref={floatingCollaboratorsRef} />
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bronotion. All rights reserved.</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}