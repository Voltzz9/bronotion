//floating-collaborators
"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import useNoteId from '@/app/hooks/useNoteId'
import Image from 'next/image'
import { useSocket } from '@/hooks/useSocket'
import { useSession } from 'next-auth/react'

const URL = process.env.NEXT_PUBLIC_API_URL;

interface Collaborator {
  image: string
  id: string
  username: string
  email: string
  is_manual: boolean
  registration_date: Date
}

interface FloatingCollaboratorsProps {
  current_userId: string
}

const FloatingCollaborators = forwardRef<{ fetchCollaborators: () => void }, FloatingCollaboratorsProps>(({ }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [current_userId, setCurrentUserId] = useState('')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const noteId = useNoteId()
  const [connectedUsers, setConnectedUsers] = useState<string[]>([])
  const { socket, isConnected, joinNote, leaveNote } = useSocket()
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id)
      setCurrentUserId(session.user.id)
  }, [session])

  useEffect(() => {
    if (noteId !== null && noteId !== undefined) {
      const fetchCollaborators = async () => {
        try {
          const response = await fetch(URL + `notes/${noteId}/shared-users`,
            {
              headers: {
                'Authorization': `Bearer ${session?.user?.id}`,
              },
            }
          )
          if (!response.ok) {
            throw new Error('Failed to fetch Users')
          }
          const data: Collaborator[] = await response.json()
          // Remove the current user from the list of collaborators
          console.log("Before:" + data)
          const currentUser = data.findIndex((collaborator) => collaborator.id === current_userId)
          if (currentUser > -1) {
            data.splice(currentUser, 1)
          }
          console.log(data)
          setCollaborators(data)
          console.log(data)
        } catch (error) {
          console.error('Error fetching users:', error)
        }
      }
      fetchCollaborators()
    }
  }, [noteId, current_userId, session])


  useImperativeHandle(ref, () => ({
    fetchCollaborators
  }));

  const fetchCollaborators = async () => {
    if (noteId === null || noteId === undefined) return;

    try {
      const response = await fetch(URL + `notes/${noteId}/shared-users`
        ,{
          headers: {
            'Authorization': `Bearer ${session?.user?.id}`,
          },
        }
      )
      if (!response.ok) {
        throw new Error('Failed to fetch Users')
      }
      const data: Collaborator[] = await response.json()
      // Remove the current user from the list of collaborators
      console.log("Before:" + data)
      const currentUser = data.findIndex((collaborator) => collaborator.id === current_userId)
      if (currentUser > -1) {
        data.splice(currentUser, 1)
      }
      console.log(data)
      setCollaborators(data)
      console.log(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {

    if (isConnected && noteId && current_userId) {
      joinNote(noteId, current_userId)

      const handleUserConnected = (usersInNote: string[]) => {
        console.log("User connected event received:", usersInNote)
        setConnectedUsers(usersInNote)
      }

      const handleUserDisconnected = (usersInNote: string[]) => {
        console.log("User disconnected event received:", usersInNote)
        setConnectedUsers(usersInNote)
      }

      if (socket) {
        socket.on('user-connected', handleUserConnected)
        socket.on('user-disconnected', handleUserDisconnected)
      }
      return () => {
        leaveNote(noteId, current_userId)
        if (socket) {
          socket.off('user-connected', handleUserConnected)
          socket.off('user-disconnected', handleUserDisconnected)
        }
      }
    }
  }, [isConnected, socket, noteId, current_userId, joinNote, leaveNote])


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-8 bottom-8 w-32 bg-background shadow-lg overflow-hidden rounded-lg">
      <div
        className="text-center w-full bg-primary px-0 py-0 rounded-lg text-primary-foreground flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-1 font-semibold arrow bg-accent rounded-lg w-full text-center">Collaborators</div>
        {isExpanded ? <ChevronDown size={0} /> : <ChevronUp size={0} />}
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden w-32"
          >
            <ul className="p-1 space-y-1 rounded-lg">
              {collaborators.map((collaborator) => (
                <li
                  key={collaborator.id}
                  className={`flex items-center space-x-2 rounded-lg ${!connectedUsers.includes(collaborator.id) ? 'text-gray-800' : 'text-green-500'
                    }`}
                >
                  {collaborator.image && (
                    <Image
                      src={collaborator.image}
                      alt={`${collaborator.username}'s avatar`}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm rounded-lg">{collaborator.username}</span>
                </li>
              ))}

            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

FloatingCollaborators.displayName = 'FloatingCollaborators'

export { FloatingCollaborators }