'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import InlineSearchBar from './inline-search-bar'
import { Button } from './ui/button'
import { CollaboratorPopup } from '@/components/collaborator-popup'
import { useSelector } from 'react-redux';

interface Note {
  note_id: string
  title: string
  content: string
  tag_id: string
  created_at: Date
  updated_at: Date
}

// Sample JSON data
const sampleNotes: Note[] = [
  {
    note_id: "1",
    title: "Meeting Notes",
    content: "Discussed project timeline and goals",
    tag_id: "work",
    created_at: new Date("2024-09-30T10:00:00Z"),
    updated_at: new Date("2024-09-30T10:30:00Z")
  },
  {
    note_id: "2",
    title: "Shopping List",
    content: "Milk, eggs, bread, vegetables",
    tag_id: "personal",
    created_at: new Date("2024-10-01T09:00:00Z"),
    updated_at: new Date("2024-10-01T09:15:00Z")
  },
  {
    note_id: "3",
    title: "Book Ideas",
    content: "Sci-fi novel about time travel",
    tag_id: "creative",
    created_at: new Date("2024-10-02T14:00:00Z"),
    updated_at: new Date("2024-10-02T14:45:00Z")
  },
  {
    note_id: "4",
    title: "Bug Fix #123",
    content: "Fixed issue with login authentication",
    tag_id: "work",
    created_at: new Date("2024-10-03T11:00:00Z"),
    updated_at: new Date("2024-10-03T11:30:00Z")
  }
]

export function TaggedNotesPanelComponent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [uniqueTagIds, setUniqueTagIds] = useState<string[]>([])
  const [openTags, setOpenTags] = useState<string[]>([])

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        //const response = await fetch('/users/1/notes')
        //if (!response.ok) {
        // throw new Error('Failed to fetch notes')
        //}
        // const data: Note[] = await response.json()
        setNotes(sampleNotes)

        const uniqueIds = Array.from(new Set(sampleNotes.map((note: Note) => note.tag_id)))
        setUniqueTagIds(uniqueIds)
      } catch (error) {
        console.error('Error fetching notes:', error)
      }
    }

    fetchNotes()
  }, [])

  const toggleTag = (tagId: string) => {
    setOpenTags(prevOpenTags =>
      prevOpenTags.includes(tagId)
        ? prevOpenTags.filter(id => id !== tagId)
        : [...prevOpenTags, tagId]
    )
  }

  return (
    <div className="w-full mx-auto bg-gray-100 min-h-screen">

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="border-b">
          <InlineSearchBar />
        </div>
        <div className="p-2 border-b">
          <CollaboratorPopup />
        </div>
        {uniqueTagIds.map((tagId) => (
          <div key={tagId}>
            <button
              onClick={() => toggleTag(tagId)}
              className="flex items-center justify-between w-full text-left border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">{tagId}</span>
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${openTags.includes(tagId) ? 'transform rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openTags.includes(tagId) ? 'max-h-[500px]' : 'max-h-0'}`}
            >
              <div className="bg-gray-50">
                {notes.filter(note => note.tag_id === tagId).map((note, index, filteredNotes) => (
                  <div
                    key={note.note_id}
                    className={`p-2 ${index !== filteredNotes.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="text-sm text-center"> {note.title} </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div >
  )
}