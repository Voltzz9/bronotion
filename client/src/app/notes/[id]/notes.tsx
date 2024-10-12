"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
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
import { format } from 'date-fns';

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
  const { socket, joinNote, leaveNote, updateNote } = useSocket()
  const [userId, setUserId] = useState('')
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
  const [noteTitle, setNoteTitle] = useState('');
  const [lastEdited, setLastEdited] = useState('2012-02-20');

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
  }, [octokit.rest.emojis]);

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
    if (note) {
      const parseMarkdown = async () => {
        const parsedMarkdown = await marked.parse(note)
        const sanitizedHtml = DOMPurify.sanitize(parsedMarkdown)
        setParsedNote(sanitizedHtml)
      }
      parseMarkdown()
    }
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
          'Authorization': `Bearer ${session?.user?.id}`,
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
        const resp = await fetch(`${URL}users/${session.user.id}`
          ,{
            headers: {
              'Authorization': `Bearer ${session.user.id}`,
            }
        })
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
            const response = await fetch(`${URL}notes/${noteId}`,
              {
                headers: {
                  'Authorization': `Bearer ${session?.user?.id}`,
              }
            })
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
  const fetchNote = useCallback(async () => {
    try {
      const response = await fetch(`${URL}notes/${noteId}`)
      if (response.status === 404) {
        router.push('/404')
        return
      }
      const data: Note = await response.json();
      setNote(data.content);
      setNoteTitle(data.title);
      console.log(data.updated_at);
      if (data.created_at) {
        setLastEdited(data.created_at.toString());
      }
      console.log(lastEdited);
    } catch (error) {
      console.error('Error fetching note:', error)
    }
  }, [noteId, router, setNote, setNoteTitle, setLastEdited, lastEdited]);


  useEffect(() => {
    fetchNote();
    if (socket && noteId && session?.user?.id) {
      setUserId(session.user.id);
      joinNote(noteId, session.user.id)

      return () => {
        if (noteId && session?.user?.id) {
          leaveNote(noteId, session?.user?.id)
        }
      }
    }
  }, [socket, noteId, session?.user?.id, joinNote, leaveNote, fetchNote]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight + 10;
    }
  }, [note]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCollaboratorAdded={sendAddCollabUpdate} />
      <div className="pb-20"> </div>
      <div className="p-2 bg-white shadow-md rounded-lg m-4">
        <h1 className=" text-center text-black font-bold mb-0 text-4xl">{noteTitle}</h1>
        <p className="text-center text-gray-500 text-sm">Created At: {format(lastEdited, 'yyyy-MM-dd hh:mm')}</p>
      </div>
      <main className="flex flex-grow">
        <div className="w-2/4 pb-4 pr-4 flex flex-col pl-4">
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
        <div className="w-2/4 pb-4 pl-4 flex flex-col pr-4">
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

      <Toaster />
    </div>
  );
}