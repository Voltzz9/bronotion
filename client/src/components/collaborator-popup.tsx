"use client"

import { useEffect, useState, useCallback } from "react"
import { Key, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import useNoteId from "@/app/hooks/useNoteId"

const URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  user_id: number
  username: string
  email: string
  avatar_url: string
  is_oauth: string
  is_manual: string
}

export function CollaboratorPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollaborator, setSelectedCollaborator] = useState<User | null>(null)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const noteId = useNoteId()

  const fetchSearchResults = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(URL+`users/search?query=${encodeURIComponent(query)}&prefix=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch Users');
      }
      const data: User[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        fetchSearchResults(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchSearchResults]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCollaboratorClick = (collaborator: User) => {
    setSelectedCollaborator(collaborator)
  }

  const handleConfirmAdd = async () => {
    // Here you would typically send a request to your backend to add the collaborator
    const selectedCollaboratorPostInfo = {
      sharedWithUserId: `${selectedCollaborator?.user_id}`, canEdit: true
    }
    console.log(`Added collaborator: ${selectedCollaborator?.username}`)
    try {

      const response = await fetch(`http://localhost:8080/notes/${noteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedCollaboratorPostInfo),
      });
      const result = await response.json();
      console.log(result); // Handle the response
    } catch (error) {
      console.error('Error sending POST request:', error);
    }
    setSelectedCollaborator(null)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex-grow w-full h-full">Add Collaborator</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Collaborator</DialogTitle>
          <DialogDescription>
            Search for a collaborator to add to your shared workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collaborators..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {isLoading ? (
              <p>Loading...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between py-2 px-1 hover:bg-accent cursor-pointer"
                  onClick={() => handleCollaboratorClick(user)}
                >
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="ghost" size="sm">Add</Button>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={!!selectedCollaborator} onOpenChange={() => setSelectedCollaborator(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Collaborator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add {selectedCollaborator?.username} to your shared workspace?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdd}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}