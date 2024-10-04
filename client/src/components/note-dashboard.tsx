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
import { NoteSelector } from "@/components/note-selector"

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
  // Add other fields as necessary
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
  // Add other fields as necessary
}

interface ActiveEditor {
  active_editor_id: number;
  note_id: number;
  user_id: string;
  last_active: Date;
  // Add other fields as necessary
}

export function NoteDashboardV2() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [noteView, setNoteView] = useState('all'); // 'all', 'my', 'shared'

  useEffect(() => {
    if (session?.user?.id) {
      console.log('Session User ID:', session.user.id);
      fetchNotes(session.user.id);
      fetchTags(session.user.id);
    }
  }, [session, noteView]); // Re-fetch notes when noteView changes

  const fetchTags = async (userId: string) => {
    try {
      const response = await fetch(`${URL}tags/${userId}`);
      const data = await response.json();
      console.log('Tags:', data);
      const tags = data.map((tag: any) => tag.name);
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const fetchNotes = async (userId: string) => {
    try {
      let fetchUrl = `${URL}users/${userId}/notes`;
      let requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ includeShared: true }), // Default to includeShared: true
      };
  
      if (noteView === 'own') {
        requestOptions.body = JSON.stringify({ includeShared: false });
      } else if (noteView === 'shared') {
        fetchUrl = `${URL}users/${userId}/shared-notes`;
        requestOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }
  
      console.log('Fetching notes from:', fetchUrl);
      const response = await fetch(fetchUrl, requestOptions);
  
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
  
      const formattedNotes = data.map((item: any) => {
        const note = noteView === 'shared' ? item : item;
        return {
          note_id: note.note_id,
          title: note.title,
          content: note.content,
          user_id: note.user_id,
          created_at: new Date(note.created_at),
          updated_at: new Date(note.updated_at),
          is_deleted: note.is_deleted,
          user: note.user ? { id: note.user.id, username: note.user.username, image: note.user.image } : { id: '', username: '', image: '' }, // Include username and image
          tags: note.tags || [], // Ensure tags is always an array
          shared_notes: [], // Add empty array for shared_notes
          active_editors: [], // Add empty array for active_editors
        };
      });
  
      setNotes(formattedNotes);
  
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const addNewNote = async () => {
    if (!session?.user?.id) return;

    const newNote = {
      title: 'New Note',
      content: "# This is a sample note \n\nYou can edit this note using Markdown syntax.",
      userId: session.user.id,
    };

    try {
      // contact the API to create a new note
      const response = await fetch(URL + 'notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(response);

      // update the notes state with the new note
      const userId = session?.user?.id;
      if (userId) {
        setTimeout(() => fetchNotes(userId), 2000);
      }
      fetchNotes(session.user.id);
    } catch (error) {
      console.error('Failed to add new note:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag)))
  );

  useEffect(() => {
    // Update tags based on filtered notes
    const uniqueTags = Array.from(new Set(filteredNotes.flatMap(note => note.tags)));
    if (JSON.stringify(uniqueTags) !== JSON.stringify(allTags)) {
      setAllTags(uniqueTags);
    }
  }, [filteredNotes, allTags]);

  // Sort tags to ensure selected tags appear first
  const sortedTags = [...allTags].sort((a, b) => {
    const aSelected = selectedTags.includes(a);
    const bSelected = selectedTags.includes(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

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
          <div className="flex justify-between items-center mt-4">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border h-14">
              <div className="flex w-max space-x-2 p-4">
                {sortedTags.map((tag) => (
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
            <div className="ml-4 h-14">
              <NoteSelector value={noteView} onChange={setNoteView} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filteredNotes.map((note) => (
              <Link key={note.note_id} href={`/notes/${note.note_id}`} passHref>
                <Card className="flex flex-col cursor-pointer h-52"> {/* Set a fixed height */}
                  <CardHeader className="flex-grow pb-2">
                    <CardTitle className="text-lg text-secondary">{note.title}</CardTitle>
                    <ScrollArea className="h-16 w-full mt-2">
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-2">
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
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}