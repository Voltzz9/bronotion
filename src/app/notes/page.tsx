'use client'

import React, { useState } from 'react'
import Link from 'next/link'

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
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            CollabNotes
          </Link>
          <div className="space-x-4">
            <button className="text-gray-600 hover:text-blue-600">Save</button>
            <button 
              onClick={() => setShowCollaboratorModal(true)}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Share
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
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
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 CollabNotes. All rights reserved.</p>
        </div>
      </footer>

      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Add Collaborator</h2>
            <input
              type="text"
              value={newCollaborator}
              onChange={(e) => setNewCollaborator(e.target.value)}
              placeholder="Enter collaborator's name"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCollaboratorModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollaborator}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4">
        <h3 className="font-bold mb-2">Collaborators</h3>
        <ul>
          {collaborators.map((collaborator, index) => (
            <li key={index} className="flex items-center mb-2">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                {collaborator[0]}
              </span>
              {collaborator}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}