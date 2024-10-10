'use client'

import React, { useEffect, useState, useRef } from 'react'
import Header from '@/components/ui/header'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { FloatingCollaborators } from '@/components/floating-collaborators'
import useNoteId from '@/app/hooks/useNoteId'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/hooks/useSocket'

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
  const { data: session } = useSession()
  const [note, setNote] = useState('')
  const [parsedNote, setParsedNote] = useState(`# Rendered Markdown`)
  const noteId = useNoteId()
  const router = useRouter()
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [userId, setUserId] = useState("")
  const { socket, joinNote, leaveNote, updateNote } = useSocket()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

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

      return () => {
        socket.off('note-updated', handleNoteUpdated)
      }
    }
  }, [socket])

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
        saveNote(content)
      }
    }, 2000)

    setTimeoutId(newTimeoutId)
  }

  const saveNote = async (content: string) => {
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

  // Scroll to bottom with an extra offset when the note content changes
  useEffect(() => {
    if (textAreaRef.current) {
      // Adding an offset of 10px to ensure there is no space left at the bottom
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight + 10;
    }
  }, [note]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex flex-grow pt-24 px-8 h-[calc(100vh-8rem)] mx-auto">
        <div className="w-2/4 pb-4 pr-4 flex flex-col h-full">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col h-full">
            <textarea
              value={note}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow overflow-auto"
              ref={textAreaRef}
            />
          </div>
        </div>
        <div className="w-2/4 pb-4 pl-4 flex flex-col h-full">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col h-full">
            <div
              className="w-full h-full border-none outline-none p-4 flex-grow overflow-auto markdown-style"
              dangerouslySetInnerHTML={{ __html: parsedNote }}
            />
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              saveNote(note);
            }}
          >
            Save
          </Button>
        </div>
      </main>
      <FloatingCollaborators current_userId={userId} />
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bronotion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}