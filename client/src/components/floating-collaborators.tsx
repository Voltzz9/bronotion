"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import useNoteId from '@/app/hooks/useNoteId'

const URL = process.env.NEXT_PUBLIC_API_URL;

interface Collaborator {
  user_id: number
  username: string
  email: string
  avatar_url: string
  is_manual: boolean
  registration_date: Date
}

export function FloatingCollaborators() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const noteId = useNoteId()

  useEffect(() => {
    if (noteId !== null && noteId !== undefined) {
      const fetchCollaborators = async () => {
        try {
          const response = await fetch(URL+`notes/${noteId}/shared-users`)
          if (!response.ok) {
            throw new Error('Failed to fetch Users')
          }
          const data: Collaborator[] = await response.json()
          setCollaborators(data)
          console.log(data)
        } catch (error) {
          console.error('Error fetching users:', error)
        }
      }
      fetchCollaborators()
    }
  }, [noteId])


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
                <li key={collaborator.user_id} className="flex items-center space-x-2 rounded-lg">
                  <img
                    src={collaborator.avatar_url}
                    alt={`${collaborator.username}'s avatar`}
                    className="w-4 h-4 rounded-full"
                  />
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