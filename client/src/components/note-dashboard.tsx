"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PlusIcon, SearchIcon, CalendarIcon, UserIcon, Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { NoteSelector } from "@/components/note-selector"
import { TagCombobox } from '@/components/tag-combobox'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion' // Add this import

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
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [noteView, setNoteView] = useState('all'); // 'all', 'my', 'shared'
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [newNoteId, setNewNoteId] = useState<number | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);


  const filteredNotes = notes.filter(note =>
    note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag)))
  );

  // Animation variants
  const noteVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
  };

  const fetchNotesAndTags = useCallback(async (userId: string) => {
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
        console.log('Fetching shared notes for user:', userId);
        fetchUrl = `${URL}users/${userId}/shared-notes`;
        requestOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      const response = await fetch(fetchUrl, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format');
      }

      const formattedNotes = data.map((note: Note) => ({
        note_id: note.note_id,
        title: note.title,
        content: note.content,
        user_id: note.user_id,
        created_at: new Date(note.created_at),
        updated_at: new Date(note.updated_at),
        is_deleted: note.is_deleted,
        user: note.user ? { id: note.user.id, username: note.user.username, image: note.user.image } : { id: '', username: '', image: '' },
        tags: note.tags || [],
        shared_notes: [],
        active_editors: [],
      }));

      setNotes(formattedNotes);

      // Extract all unique tags from the notes
      const uniqueTags = Array.from(new Set(formattedNotes.flatMap((note: Note) => note.tags)));
      setAllTags(uniqueTags);  // Set tags based on the current note view

    } catch (error) {
      console.error('Failed to fetch notes and tags:', error);
    }
  }, [noteView]);

  useEffect(() => {
    if (session?.user?.id) {
      console.log('Session User ID:', session.user.id);
      fetchNotesAndTags(session.user.id);
    }
  }, [session, noteView, fetchNotesAndTags]);

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
        setTimeout(() => fetchNotesAndTags(userId), 1000);
      }
      fetchNotesAndTags(session.user.id);

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
  
    setIsAddingNote(true);
  
    console.log('Adding new note for user:', session.user.id);
  
    const newNote = {
      title: 'New Note',
      content: "# This is a sample note \n\nYou can edit this note using Markdown syntax.",
      userId: session.user.id,
    };
  
    try {
      const response = await fetch(`${URL}notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const createdNote = await response.json();
      const formattedNote: Note = {
        note_id: createdNote.noteId,
        title: newNote.title,
        content: newNote.content,
        user_id: newNote.userId,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        user: { id: createdNote.user.id, username: createdNote.user.username, image: createdNote.user.image },
        tags: [],
        shared_notes: [],
        active_editors: [],
      };
      setNewNoteId(formattedNote.note_id);
      setNotes(prevNotes => [...prevNotes, formattedNote]);
    } catch (error) {
      console.error('Failed to add new note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const addNewTag = async (tag: string, noteId: string) => {
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
        setTimeout(() => fetchNotesAndTags(userId), 1000);
      }
      fetchNotesAndTags(session.user.id);
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
        setTimeout(() => fetchNotesAndTags(userId), 1000);
      }
      fetchNotesAndTags(session.user.id);

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
    );
  };

  // Sorting tags to display selected tags first
  const sortedTags = [...allTags].sort((a, b) => {
    const aSelected = selectedTags.includes(a);
    const bSelected = selectedTags.includes(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const updateNoteTitle = async (noteId: number) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`${URL}notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingTitle }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the notes state
      setNotes(prevNotes => prevNotes.map(note => note.note_id === noteId ? { ...note, title: editingTitle } : note));
      setEditingNoteId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update note title:', error);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.note_id);
    setEditingTitle(note.title);
  };

  const deleteNote = async (noteId: number) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`${URL}notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotes(prevNotes => prevNotes.map(note => 
        note.note_id === noteId ? { ...note, isDeleting: true } : note
      ));

      setTimeout(() => {
        setNotes(prevNotes => prevNotes.filter(note => note.note_id !== noteId));
      }, 200); // This should match the animation duration
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-secondary">Notes Dashboard</CardTitle>
            <Button onClick={addNewNote} disabled={isAddingNote}>
              {isAddingNote ? (
                <span className="animate-spin mr-2">&#8987;</span>
              ) : (
                <PlusIcon className="mr-2 h-4 w-4" />
              )}
              {isAddingNote ? 'Adding...' : 'New Note'}
            </Button>
          </div>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-8 w-full"
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
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.note_id}
                layout
                initial="hidden"
                animate={note.note_id === newNoteId ? "visible" : "visible"}
                exit="exit"
                variants={noteVariants}
                transition={{ duration: 0.2 }}
              >
                
                  <Card className={`flex flex-col cursor-pointer h-52 relative`}>
                  
                <CardHeader className="flex-grow pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex">
                      <CardTitle className="mt-1 text-lg text-secondary">
                      {editingNoteId !== note.note_id ? (
                          <Link href={`/notes/${note.note_id}`} passHref className="cursor-pointer">
                            {note.title}
                          </Link>
                          
                        ) : (
                          <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => updateNoteTitle(note.note_id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            updateNoteTitle(note.note_id);
                            }
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          autoFocus
                          />
                        )}
                      </CardTitle>
                        {editingNoteId !== note.note_id && (
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="ml-2 text-muted-foreground hover:bg-muted-foreground/20" 
                          onClick={(e) => {
                          e.preventDefault(); // Prevent default button behavior
                          e.stopPropagation(); // Prevent link navigation
                          handleEditClick(note);
                          }}
                        >
                          <Pencil className="h-4 w-4"/>
                        </Button>
                        )}
                    
                    </div>
            
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-6 right-2 text-gray-400 hover:text-red-500 hover:bg-muted-foreground/20 transition-colors"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default button behavior
                        e.stopPropagation(); // Prevent link navigation
                        deleteNote(note.note_id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-12 w-full overflow-x-auto rounded-md">
                      <div className="flex flex-nowrap gap-2 mt-2">
                        {note.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
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
                          onTagToggle={(tagName, tagId) => {
                            addTagToNote(note.note_id.toString(), tagName, tagId);
                          }}
                          handleCreateTag={(tagName) => {
                            addNewTag(tagName, note.note_id.toString());
                          }}
                        />
                      </div>
                      <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                </CardHeader>
                <Link href={`/notes/${note.note_id}`} passHref>
                <CardFooter className="mt-auto pt-2">
                  <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(note.updated_at, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      {note.user.image ? (
                        <>
                          <Image
                            src={note.user.image}
                            alt={note.user.username}
                            className="mr-2 h-4 w-4 rounded-full"
                            width={64}
                            height={64}
                          />
                          <span className="mr-2">{note.user.username}</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span className="mr-2">{note.user.username}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardFooter>
                </Link>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}