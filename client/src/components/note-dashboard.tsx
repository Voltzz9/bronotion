"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PlusIcon, SearchIcon, CalendarIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'

const URL = process.env.NEXT_PUBLIC_API_URL;

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  lastEditDate: Date
  lastEditedBy: string
}

const mockNotes: Note[] = [
  { id: '1', title: 'Q4 Planning', tags: ['Work', 'Planning'], content: "test", lastEditDate: new Date('2023-09-28'), lastEditedBy: 'Alice' },
  { id: '2', title: 'Grocery List', tags: ['Personal', 'Shopping'], content: "test", lastEditDate: new Date('2023-09-29'), lastEditedBy: 'Bob' },
  { id: '3', title: 'Book Notes: 1984', tags: ['Study', 'Literature'], content: "test", lastEditDate: new Date('2023-09-30'), lastEditedBy: 'Charlie' },
  { id: '4', title: 'Workout Plan', tags: ['Health', 'Fitness'], content: "test", lastEditDate: new Date('2023-10-01'), lastEditedBy: 'David' },
  { id: '5', title: 'Travel Itinerary', tags: ['Personal', 'Travel'], content: "test", lastEditDate: new Date('2023-10-02'), lastEditedBy: 'Eve' },
]

const allTags = Array.from(new Set(mockNotes.flatMap(note => note.tags)))

export function NoteDashboardV2() {
  const [searchTerm, setSearchTerm] = useState('')
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    fetchNotes()
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch(`${URL}/users/1/tags`) // TODO replace with actual user id
      const data = await response.json()
      const tags = data.map((tag: any) => tag.name)
      setAllTags(tags)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag)))
  )

  const addNewNote = () => {
    const newNote = {
      title: 'New Note',
      content: "# This is a sample note \n\nYou can edit this note using Markdown syntax.",
      user_id: 1, // TODO replace with actual user id
    }

    // contact the API to create a new note
    const response = fetch(URL + '/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNote),
    })

    console.log(response)

    // update the notes state with the new note
    // TODO fix this so it checks for success and refreshes the notes
    // wait 2 seconds for the API to update
    setTimeout(() => fetchNotes(), 2000)
    fetchNotes()
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(URL + '/users/1/notes') // TODO replace with actual user id
      const data = await response.json()
      console.log(data)
      
      interface ApiNote {
        note_id: number;
        title: string;
        content: string;
        tag_id?: string;
        updated_at: string;
      }

      const formattedNotes = data.map((note: ApiNote) => ({
        id: note.note_id.toString(), // Ensure id is a string
        title: note.title,
        content: note.content,
        tags: note.tag_id ? [note.tag_id] : [], // TODO handle tags properly, also dynamically load
        lastEditDate: new Date(note.updated_at), // Convert updated_at to Date
        lastEditedBy: 'User', // TODO replace with actual user name
      }));

      setNotes(formattedNotes);
      console.log(formattedNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
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
              <Link key={note.id} href={`/notes/${note.id}`} passHref>
                <Card className="flex flex-col cursor-pointer">
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
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}