"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import useNoteId from '@/app/hooks/useNoteId'
import Image from 'next/image'
import io, { Socket } from 'socket.io-client'

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
  current_userId: string;
}

export const FloatingCollaborators: React.FC<FloatingCollaboratorsProps> = ({ current_userId }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const noteId = useNoteId()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  // Fetch collaborators for the note
  useEffect(() => {
    if (noteId !== null && noteId !== undefined) {
      const fetchCollaborators = async () => {
        try {
          const response = await fetch(URL+`notes/${noteId}/shared-users`)
          if (!response.ok) {
            throw new Error('Failed to fetch Users')
          }
          const data: Collaborator[] = await response.json()

          // Remove the current user from the list of collaborators
          console.log("Before:"+data)
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
  }, [noteId, current_userId])

  // Handle socket connection
  useEffect(() => {
    console.log("Connecting to:", URL)

    const newSocket = io(URL)
    setSocket(newSocket)

    return () => {
      if (noteId) {
        newSocket.emit('leave-note', { noteId, userId: current_userId }) // Emit leave event
      }
      newSocket.close()
    }
  }
  , [noteId, current_userId])


  useEffect(() => {
    if (noteId && socket) {
      socket.on('user-connected', (usersInNote) => {
        console.log("User connected event received:", usersInNote);
        setConnectedUsers(usersInNote);  // Ensure this list is accurate
      });
      
      socket.on('user-disconnected', (usersInNote) => {
        console.log("User disconnected event received:", usersInNote);
        setConnectedUsers(usersInNote);
      });
  
      return () => {
        socket.off('user-connected');
        socket.off('user-disconnected');
      };
    }
  }, [socket, noteId, current_userId, connectedUsers]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-8 bottom-28 w-32 bg-background shadow-lg overflow-hidden rounded-lg"
    >
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
                  className={`flex items-center space-x-2 rounded-lg ${
                    // print the collaborators that are connected
                    !connectedUsers.includes(collaborator.id) ? 'bg-gray-200' : 'bg-green-200'
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
                <p className="text-center text-xs">
                  Current collaborators online: {connectedUsers.length}
                </p>
              </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}