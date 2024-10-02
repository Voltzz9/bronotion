"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

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

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        console.log(noteId)
        const response = await fetch(`http://localhost:8080/notes/${noteId}/shared-users`)
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
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-8 bottom-28 w-30 bg-background shadow-lg overflow-hidden rounded-lg"
    >
      <div
        className="bg-primary px-0 py-0 rounded-lg text-primary-foreground flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="font-semibold pb-0 arrow bg-accent rounded-lg px-1">Collaborators</div>
        {isExpanded ? <ChevronDown size={0} /> : <ChevronUp size={0} />}
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="p-2 space-y-1 rounded-lg">
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