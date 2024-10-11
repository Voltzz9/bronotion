"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import useNoteId from '@/app/hooks/useNoteId'
import Image from 'next/image'

const URL = process.env.NEXT_PUBLIC_API_URL;

interface Collaborator {
  image: string
  user_id: number
  username: string
  email: string
  is_manual: boolean
  registration_date: Date
}

interface FloatingCollaboratorsProps {
  current_user: string;
}

export const FloatingCollaborators: React.FC<FloatingCollaboratorsProps> = ({ current_user }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const noteId = useNoteId()

  useEffect(() => {
    if (noteId !== null && noteId !== undefined) {
      const fetchCollaborators = async () => {
        try {
          const response = await fetch(URL + `notes/${noteId}/shared-users`)
          if (!response.ok) {
            throw new Error('Failed to fetch Users')
          }
          const data: Collaborator[] = await response.json()
          // Remove the current user from the list of collaborators
          console.log("Before:" + data)
          const currentUser = data.findIndex((collaborator) => collaborator.username === current_user)
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
  }, [noteId, current_user])


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
                <li key={collaborator.username} className="flex items-center space-x-2 rounded-lg">
                  {collaborator.image && (
                    <Image
                      src={collaborator.image}
                      alt={`${collaborator.username}'s avatar`}
                      width={16} // Set width
                      height={16} // Set height
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
}