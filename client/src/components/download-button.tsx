import React from 'react';
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { marked } from 'marked'

interface DownloadButtonProps {
  noteId: number;
  noteTitle: string;
  noteContent: string;
}

export function DownloadButton({ noteId, noteTitle, noteContent }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      // Convert markdown to HTML
      const html = await marked(noteContent);

      // Create a new jsPDF instance
      const pdf = new jsPDF();

      // Add the HTML content to the PDF
      pdf.html(html, {
        callback: function (pdf) {
          // Save the PDF
          pdf.save(`${noteTitle}.pdf`);
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 650
      });
    } catch (error) {
      console.error('Failed to download note:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-6 right-10 text-gray-400 hover:text-blue-500 hover:bg-muted-foreground/20 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDownload();
      }}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}