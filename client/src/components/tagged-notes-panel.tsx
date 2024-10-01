'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
}

interface Tag {
  id: string
  name: string
  notes: Note[]
}

const sampleTags: Tag[] = [
  {
    id: '1',
    name: 'Work',
    notes: [
      { id: '1', title: 'Meeting notes', content: 'Discuss project timeline' },
      { id: '2', title: 'To-do list', content: 'Finish report by Friday' },
    ],
  },
  {
    id: '2',
    name: 'Personal',
    notes: [
      { id: '3', title: 'Grocery list', content: 'Milk, eggs, bread' },
      { id: '4', title: 'Birthday ideas', content: 'Gift ideas for mom' },
    ],
  },
]

export function TaggedNotesPanelComponent() {
  const [openTags, setOpenTags] = useState<string[]>([])

  const toggleTag = (tagId: string) => {
    setOpenTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="w-full mx-auto bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg overflow-hidden">
        {sampleTags.map((tag) => (
          <div key={tag.id}>
            <button
              onClick={() => toggleTag(tag.id)}
              className="flex items-center justify-between w-full text-left border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">{tag.name}</span>
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${
                  openTags.includes(tag.id) ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openTags.includes(tag.id) ? 'max-h-[500px]' : 'max-h-0'
              }`}
            >
              <div className="bg-gray-50">
                {tag.notes.map((note, index) => (
                  <div
                    key={note.id}
                    className={`p-4 ${
                      index !== tag.notes.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <h3 className="font-medium">{note.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}