'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/ui/header'

export default function NotesPage() {
  const [note, setNote] = useState('')
  const [collaborators, setCollaborators] = useState(['Alice', 'Bob'])
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false)
  const [newCollaborator, setNewCollaborator] = useState('')

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const handleAddCollaborator = () => {
    if (newCollaborator && !collaborators.includes(newCollaborator)) {
      setCollaborators([...collaborators, newCollaborator])
      setNewCollaborator('')
      setShowCollaboratorModal(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <Header></Header>
      <main className="flex">

        <div className="flex-grow container mx-auto px-4 py-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 border-b">
              <input
                type="text"
                placeholder="Untitled Note"
                className="text-2xl font-bold bg-transparent border-none outline-none w-full"
              />
            </div>
            <div className="p-4">
              <textarea
                value={note}
                onChange={handleNoteChange}
                placeholder="Start typing your note here..."
                className="w-full h-96 resize-none border-none outline-none"
              />
            </div>
          </div>
        </div>


        <div className="flex-grow container mx-auto px-4 py-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden text-center">
            <div className="p-4 text-center">
              <textarea
                value={note}
                onChange={handleNoteChange}
                placeholder="MARKDOWN WILL RENDER HERE"
                className="resize-none border-none outline-none"
              />
            </div>
          </div>
        </div>




      </main>


      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 CollabNotes. All rights reserved.</p>
        </div>
      </footer>



    </div>
  )
}