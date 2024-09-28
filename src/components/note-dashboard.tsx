"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PlusIcon, SearchIcon, CalendarIcon, UserIcon, TagIcon } from 'lucide-react'

interface Note {
  id: string
  title: string
  tags: string[]
  lastEditDate: Date
  lastEditedBy: string
}

const mockNotes: Note[] = [
  { id: '1', title: 'Q4 Planning', tags: ['Work', 'Planning'], lastEditDate: new Date('2023-09-28'), lastEditedBy: 'Alice' },
  { id: '2', title: 'Grocery List', tags: ['Personal', 'Shopping'], lastEditDate: new Date('2023-09-29'), lastEditedBy: 'Bob' },
  { id: '3', title: 'Book Notes: 1984', tags: ['Study', 'Literature'], lastEditDate: new Date('2023-09-30'), lastEditedBy: 'Charlie' },
  { id: '4', title: 'Workout Plan', tags: ['Health', 'Fitness'], lastEditDate: new Date('2023-10-01'), lastEditedBy: 'David' },
  { id: '5', title: 'Travel Itinerary', tags: ['Personal', 'Travel'], lastEditDate: new Date('2023-10-02'), lastEditedBy: 'Eve' },
]

const allTags = Array.from(new Set(mockNotes.flatMap(note => note.tags)))

export function NoteDashboardV2() {
  const [searchTerm, setSearchTerm] = useState('')
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag)))
  )

  const addNewNote = () => {
    const newNote: Note = {
      id: (notes.length + 1).toString(),
      title: 'New Note',
      tags: ['Personal'],
      lastEditDate: new Date(),
      lastEditedBy: 'You',
    }
    setNotes([newNote, ...notes])
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-secondary">Notes Dashboard</CardTitle>
            <Button onClick={addNewNote}>
              <PlusIcon className="mr-2 h-4 w-4" /> New Note
            </Button>
          </div>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-2 p-4">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-secondary">{note.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(note.lastEditDate, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      {note.lastEditedBy}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}