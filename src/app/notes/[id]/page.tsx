'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Import useParams for routing
import Header from '@/components/ui/header';
import { marked } from 'marked'; // Import marked package

export default function NotesPage() {
  const params = useParams(); // Use useParams instead of useRouter
  const id = params?.id; // Get note ID from URL params

  const [note, setNote] = useState('');
  const [title, setTitle] = useState('Untitled Note'); // State for note title
  const [collaborators, setCollaborators] = useState(['Alice', 'Bob']);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState('');

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`http://localhost:5433/notes/${id}`); // Adjust API endpoint as necessary
      console.log(response);
      const data = await response.json();
      if (data) {
        setTitle(data.title);
        setNote(data.content);
      }
    } catch (error) {
      console.error('Failed to fetch note:', error);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  const handleAddCollaborator = () => {
    if (newCollaborator && !collaborators.includes(newCollaborator)) {
      setCollaborators([...collaborators, newCollaborator]);
      setNewCollaborator('');
      setShowCollaboratorModal(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex py-40">
        <div className="flex-grow container mx-auto px-4 py-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 border-b">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none outline-none w-full"
              />
            </div>
            <div className="p-4">
              <textarea
                value={note}
                onChange={handleNoteChange}
                placeholder="Start typing your note here..."
                className="w-full h-96 resize-none border-none outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex-grow container mx-auto px-4 py-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden text-center">
            <div className="p-4 text-center">
              <div
                className="markdown-output resize-none border-none outline-none"
                dangerouslySetInnerHTML={{ __html: marked(note) }}
              />
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bronotion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}