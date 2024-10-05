"use client"

import { useState, useEffect, useCallback } from "react"
import { Menu, Search, ChevronDown, ChevronUp, UserPlus, Tag, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"

interface Note {
  note_id: number;
  title: string;
  content?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  user: User;
  tags: TagType[];
}

interface User {
  id: string;
  username: string;
  image?: string;
}

interface TagType {
  tag_id: number;
  name: string;
}

interface TagWithNotes {
  tag_id: number;
  name: string;
  notes_id: number[];
  notes_title: string[];
}

const URL = process.env.NEXT_PUBLIC_API_URL;

export function LayoutComponent() {
  const [isSidepanelOpen, setIsSidepanelOpen] = useState(false);
  const [openTag, setOpenTag] = useState<number | null>(null);  // Ensure the type here is correct
  const [tagsWithNotes, setTagsWithNotes] = useState<TagWithNotes[]>([]); // Correctly typed state
  const { data: session } = useSession();

  const toggleSidepanel = () => setIsSidepanelOpen(!isSidepanelOpen);

  const toggleTag = (id: number) => {  // Ensure the parameter is of type number
    setOpenTag(openTag === id ? null : id);
  }

  const fetchNotesAndTags = useCallback(async (userId: string) => {
    try {
      // Fetching tags
      const fetchUrl = `${URL}users/${userId}/tags/notes`;
      const requestOptions: RequestInit = {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      };

      const response = await fetch(fetchUrl, requestOptions);

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tagsData = await response.json();  // Renamed variable to avoid confusion

      if (!tagsData || !Array.isArray(tagsData)) {
          throw new Error('Invalid data format for tags');
      }
      console.log(tagsData);
      setTagsWithNotes(tagsData);
    } catch (error) {
        console.error('Failed to fetch notes and tags:', error);
    }
  }, []);


  if (session?.user?.id) {
    fetchNotesAndTags(session.user.id);
  }

  return (
    <>
      {/* Button for toggling side panel */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidepanel}
        aria-label="Toggle sidebar"
        className="top-5.5 right-8 z-40 text-bold text-secondary"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Side panel */}
      {isSidepanelOpen && (
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out ${
            isSidepanelOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 mt-[80px] lg:mt-[80px]`}
        >
          <div className="flex flex-col h-[calc(100vh-45px)] p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notes..."
                  className="pl-8"
                />
              </div>
            </div>

            <Button className="mb-4 flex items-center justify-center" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Collaborator
            </Button>

            <nav className="space-y-2">
              {tagsWithNotes.map((tag) => (
                <div key={tag.tag_id} className="border-b border-border last:border-b-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => toggleTag(tag.tag_id)}
                  >
                    <span className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      {tag.name}
                    </span>
                    {openTag === tag.tag_id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {openTag === tag.tag_id && (
                    <div className="pl-4 py-2 space-y-2">
                      {tag.notes_title.map((noteTitle: string, index: number) => (
                        <Button key={index} variant="ghost" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          {noteTitle}
                        </Button>
                      ))}
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