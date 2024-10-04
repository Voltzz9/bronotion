'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/ui/header'
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FloatingCollaborators } from '@/components/floating-collaborators';
import useNoteId from '@/app/hooks/useNoteId';

interface Note {
  note_id: number,
  title: string,
  content: string,
  tag_id: string,
  created_at: Date,
  updated_at: Date,
}

export default function Notes() {
  const [note, setNote] = useState('')
  const [parsedNote, setParsedNote] = useState(`# Rendered Markdown`)
  const noteId = useNoteId()

  useEffect(() => {
    const parseMarkdown = async () => {
      const parsedMarkdown = await marked.parse(note);
      const sanitizedHtml = DOMPurify.sanitize(parsedMarkdown);
      setParsedNote(sanitizedHtml);
    };
    parseMarkdown();
  }, [note]);

  const setNoteContent = (content: string) => {
    setNote(content)
  }

  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        try {
          const response = await fetch(`http://localhost:8080/notes/${noteId}`);
          const data: Note = await response.json();
          setNote(data.content);  // Assuming the response has a 'content' field
        } catch (error) {
          console.error("Error fetching note:", error);
        }
      };

      fetchNote();
    }
  }, [noteId]);

  // ***************************** Push Notifications **********************

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      console.log("Service Worker found...")
      const handleServiceWorker = async () => {
        const register = await navigator.serviceWorker.register("/sw.js");

        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || "BG5_w-BpjUQfVdOWNeNBn1CsJZNWCgTezGLGGmFu6bXF7sJkXrzz4DVTKsypr72V2OdGA9g-rM4dBRbNq1vkMC8"),
        });

        console.log("Subscription object created...")
        const res = await fetch("http://localhost:8080/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "content-type": "application/json",
          },
        });
        console.log("Subscription object sent")

        console.log(res);
      };
      handleServiceWorker();
    }
  }, []);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // ***********************************************************************

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex flex-grow pt-24">
        <div className="w-2/4 pb-4 pl-4 pr-2 flex flex-col">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col">
            <textarea
              value={note}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow"
            />
          </div>
        </div>
        <div className="w-2/4 pb-4 pl-2 pr-4 flex flex-col">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-grow flex flex-col">
            <div
              className="w-full h-full resize-none border-none outline-none p-4 flex-grow overflow-auto markdown-style"
              dangerouslySetInnerHTML={{ __html: parsedNote }}
            />
          </div>
        </div>
      </main>
      <FloatingCollaborators />
      <footer className="bg-gray-800 text-white py-4">

        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Bronotion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}