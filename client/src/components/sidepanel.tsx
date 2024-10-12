/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, ChevronDown, ChevronUp, Tag, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { CollaboratorPopup } from "./collaborator-popup"
import { ScrollArea } from "@/components/ui/scroll-area"
import useNoteId from '@/app/hooks/useNoteId';
import Link from 'next/link'

interface Note {
  note_id: number;
  title: string;
}

interface TagWithNotes {
  tagId: number;
  tagName: string;
  noteIds: number[];
  noteTitles: string[];
}

interface LayoutComponentProps {
  onCollaboratorAdded?: () => void;
}

const URL = process.env.NEXT_PUBLIC_API_URL;

export function LayoutComponent({ onCollaboratorAdded }: LayoutComponentProps) {
  const [isSidepanelOpen, setIsSidepanelOpen] = useState(false);
  const [openTag, setOpenTag] = useState<number | null>(null);
  const [tagsWithNotes, setTagsWithNotes] = useState<TagWithNotes[]>([]);
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentNoteID = useNoteId();

  const toggleSidepanel = () => setIsSidepanelOpen(!isSidepanelOpen);

  const toggleTag = (id: number) => {
    setOpenTag(openTag === id ? null : id);
  };

  const fetchNotesAndTags = useCallback(async (userId: string) => {
    try {
      const fetchUrl = `${URL}users/${userId}/tags/notes`;
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.id}`,
        },
      };

      const response = await fetch(fetchUrl, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tagsData = await response.json();

      if (!Array.isArray(tagsData)) {
        throw new Error('Invalid data format for tags');
      }
      setTagsWithNotes(tagsData);
    } catch (error) {
      console.error('Failed to fetch notes and tags:', error);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotesAndTags(session.user.id);
    }
  }, [session, fetchNotesAndTags]);

  const fetchSearchResults = useCallback(async (userId: string, query: string) => {
    try {
      const fetchUrl = `${URL}users/${userId}/notes/search?query=${encodeURIComponent(query)}`;
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.id}`,
        },
      };

      const response = await fetch(fetchUrl, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Note[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }, []);

  // Debounced search functionality
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true)
        if (session?.user?.id) {
          fetchSearchResults(session.user.id, searchQuery).then(() => {
            setIsSearching(false)
          })
        }
      }
    }, 300); // 300ms delay
    return () => clearTimeout(debounceTimer); // Clean up debounce
  }, [session, searchQuery]);

  const handleNoteSelect = () => {
    // Close the sidepanel
    setIsSidepanelOpen(false);
  };

  return (
    <>
      <button
        tabIndex={0}
        id="burger"
        className={isSidepanelOpen ? "open" : ""}
        onClick={toggleSidepanel}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </button>
      {isSidepanelOpen && (
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out ${isSidepanelOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 mt-[80px] lg:mt-[80px]`}
        >
          <div className="flex flex-col h-[calc(100vh-45px)] p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search notes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsFocused(false), 200)
                  }}
                />
              </div>
              {isFocused && searchQuery && (
                <ScrollArea className="h-[200px] w-full rounded-md border mt-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No notes found</div>
                  ) : (
                    <div className="p-4">
                      {searchResults.map((result, index) => (
                        <Link href={`/notes/${result.note_id}`} key={index} passHref>
                          <div
                            className={`cursor-pointer p-2 rounded-md ${currentNoteID && Number(currentNoteID) === result.note_id ? 'bg-purple-200' : ''
                              } hover:bg-accent`} // Conditional class for highlighting
                            onMouseDown={(e) => e.preventDefault()} // Prevent default mouse down behavior
                            onClick={() => handleNoteSelect()} // Hide the side panel on click
                          >
                            <FileText className="inline-block mr-2 h-4 w-4" />
                            {result.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </div>
            <CollaboratorPopup onCollaboratorAdded={onCollaboratorAdded} />
            <nav className="space-y-2">
              {tagsWithNotes.map((tag) => (
                <div key={tag.tagId} className="border-b border-border last:border-b-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => toggleTag(tag.tagId)}
                  >
                    <span className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      {tag.tagName}
                    </span>
                    {openTag === tag.tagId ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {openTag === tag.tagId && (
                    <div className="pl-4 py-2 space-y-2">
                      {Array.isArray(tag.noteTitles) && tag.noteTitles.length > 0 ? (
                        tag.noteTitles.map((noteTitle: string, index: number) => (
                          <Link 
                          href={`/notes/${tag.noteIds[index]}`} key={index} passHref>
                            <div
                              tabIndex={0}
                              onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleNoteSelect();
                                window.location.href = `/notes/${tag.noteIds[index]}`;
                              }
                              }}
                              className={`cursor-pointer p-2 rounded-md ${currentNoteID && Number(currentNoteID) === tag.noteIds[index] ? 'bg-purple-200' : ''
                              } hover:bg-accent`} // Conditional class for highlighting
                              onMouseDown={(e) => e.preventDefault()} // Prevent default mouse down behavior
                              onClick={() => handleNoteSelect()} // Hide the side panel on click
                            >
                              <FileText className="inline-block mr-2 h-4 w-4" />
                              {noteTitle}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p>No notes available</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </>
  );
}