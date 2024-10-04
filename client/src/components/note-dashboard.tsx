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
import { useSession } from 'next-auth/react'
import { TagCombobox } from '@/components/tag-combobox'

const URL = process.env.NEXT_PUBLIC_API_URL;

interface Note {
  note_id: number;
  title: string;
  content?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  // Relations
  user: User;
  tags: string[];
  shared_notes: SharedNote[];
  active_editors: ActiveEditor[];
}

interface User {
  id: string;
  username: string;
  image?: string;
}

interface NoteTag {
  note_id: number;
  tag_id: number;
  tag: Tag;
}

interface Tag {
  tag_id: number;
  name: string;
}

interface SharedNote {
  shared_note_id: number;
  note_id: number;
  shared_with_user_id: string;
  can_edit: boolean;
  shared_at: Date;
}

interface ActiveEditor {
  active_editor_id: number;
  note_id: number;
  user_id: string;
  last_active: Date;
}

export function NoteDashboardV2() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      console.log('Session User ID:', session.user.id);
      fetchNotes(session.user.id)
      fetchTags(session.user.id)
    }
  }, [session])

  const fetchTags = async (userId: string) => {
    try {
      const response = await fetch(`${URL}tags/${userId}`)
      const data = await response.json()
      console.log('Tags:', data)
      const tags = data.map((tag: any) => tag.name)
      setAllTags(tags)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const fetchNotes = async (userId: string) => {
    try {
      const fetchUrl = `${URL}users/${userId}/notes`;
      console.log('Fetching notes from:', fetchUrl);
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Data: ', data);

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format');
      }

      interface ApiNote {
        note_id: number;
        title: string;
        content: string;
        user_id: string;
        created_at: string;
        updated_at: string;
        is_deleted: boolean;
        tags?: string[]; // Tags are returned as an array of strings
        user: {
          id: string;
          username: string;
          image?: string;
        };
      }

      const formattedNotes = data.map((note: ApiNote) => ({
        note_id: note.note_id,
        title: note.title,
        content: note.content,
        user_id: note.user_id,
        created_at: new Date(note.created_at),
        updated_at: new Date(note.updated_at),
        is_deleted: note.is_deleted,
        user: { id: note.user.id, username: note.user.username, image: note.user.image }, // Include username and image
        tags: note.tags || [], // Ensure tags is always an array
        shared_notes: [], // Add empty array for shared_notes
        active_editors: [], // Add empty array for active_editors
      }));

      setNotes(formattedNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const removeTag = async (tag: string, noteId: string) => {
    if (!session?.user?.id) return;

    console.log('Removing tag from note:', tag, noteId);

    try {
      // fetch the tag id from the tag name by calling API
      const response = await fetch(URL + 'tagnames/' + tag);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const tagId = data.tag_id;

      // contact the API to remove the tag from the note
      const response2 = await fetch(URL + 'notes/' + noteId + '/tags', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId: tagId }),
        credentials: 'include'
      });
      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response2.status}`);
      }

      // update the tags state with the new tag
      const userId = session?.user?.id;
      if (userId) {
        setTimeout(() => fetchTags(userId), 1000);
      }
      fetchTags(session.user.id);

      // update UI of note with removed tag
      const noteIndex = notes.findIndex((note) => note.note_id.toString() === noteId);
      if (noteIndex >= 0) {
        const updatedNotes = [...notes];
        updatedNotes[noteIndex].tags = updatedNotes[noteIndex].tags.filter(t => t !== tag);
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  }

  const addNewNote = async () => {
    if (!session?.user?.id) return;

    console.log('Adding new note for user:', session.user.id);

    const newNote = {
      title: 'New Note',
      content: "# This is a sample note \n\nYou can edit this note using Markdown syntax.",
      userId: session.user.id,
    }

    try {
      // contact the API to create a new note
      console.log('Contacting API to add new note:', newNote);
      const response = await fetch(URL + 'notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
        credentials: 'include'
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // update the notes state with the new note
      const userId = session?.user?.id;
      if (userId) {
        setTimeout(() => fetchNotes(userId), 2000);
      }
      fetchNotes(session.user.id);
    } catch (error) {
      console.error('Failed to add new note:', error);
    }
  }

  const addNewTag = async (tag: string, noteId:string) => {
    if (!session?.user?.id) return;

    const newTag = {
      name: tag
    }

    try {
      let newTagId = '';

      // contact the API to create a new tag
      const response = await fetch(URL + 'tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTag),
        credentials: 'include'
      });

      // if response 409 tag already exists, get the tag id
      if (response.status === 409) {
        const response2 = await fetch(URL + 'tagnames/' + tag);
        if (!response2.ok) {
          throw new Error(`HTTP error! status: ${response2.status}`);
        }
        const data = await response2.json();
        newTagId = data.tag_id;
        addTagToNote(noteId, tag, newTagId);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the new tag id
      const data = await response.json();
      newTagId = data.tag.tag_id;

      // Add the new tag to the note
      addTagToNote(noteId, tag, newTagId);

      // update the tags state with the new tag
      const userId = session?.user?.id;
      if (userId) {
        setTimeout(() => fetchTags(userId), 1000);
      }
      fetchTags(session.user.id);
    } catch (error) {
      console.error('Failed to add new tag:', error);
    }
  }

  const addTagToNote = async (noteId: string, tagName: string, tagId?: string) => {
    console.log('Adding tag to note:', noteId, tagName, tagId);
    if (!session?.user?.id) return;

    if (!tagId) {
      // fetch the tag id from the tag name by calling API
      const response = await fetch(URL + 'tagnames/' + tagName);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      tagId = data.tag_id;
    }

    const newNoteTag = {
      tagId: tagId
    }

    try {
      // contact the API to create a new tag on note
      const response = await fetch(URL + 'notes/' + noteId + '/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNoteTag),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // update the tags state with the new tag
      const userId = session?.user?.id;
      if (userId) {
        setTimeout(() => fetchTags(userId), 1000);
      }
      fetchTags(session.user.id);
      
      // update UI of note with new tag
      const noteIndex = notes.findIndex((note) => note.note_id.toString() === noteId);
      if (noteIndex >= 0) {
        const updatedNotes = [...notes];
        updatedNotes[noteIndex].tags.push(tagName);
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error('Failed to add new tag:', error);
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag)))
  )

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
                  variant={selectedTags.includes(tag) ? "selected" : "outline"}
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
              <div key={note.note_id}>
                <Card className="flex flex-col cursor-pointer h-48"> {/* Set a fixed height */}
                  <CardHeader className="flex-grow">
                    <Link  href={`/notes/${note.note_id}`} passHref>
                      <CardTitle className="text-lg text-secondary">{note.title}</CardTitle>
                    </Link>
                    <ScrollArea className="h-12 w-full overflow-x-auto rounded-md ">
                      <div className="flex flex-nowrap gap-2 mt-2">
                        {note.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => {
                              removeTag(tag, note.note_id.toString());
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                        <TagCombobox
                          initTags={allTags}
                          selectedTags={note.tags}
                          noteId={note.note_id.toString()}
                          onTagToggle={addTagToNote}
                          handleCreateTag={addNewTag}
                        />
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </CardHeader>
                  <CardFooter className="mt-auto">
                    <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(note.updated_at, 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        {note.user.image ? (
                          <img src={note.user.image} alt={note.user.username} className="mr-2 h-4 w-4 rounded-full" />
                        ) : (
                          <UserIcon className="mr-2 h-4 w-4" />
                        )}
                        {note.user.username}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}