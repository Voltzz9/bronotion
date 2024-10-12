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

export function DownloadButton({ noteTitle, noteContent }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      // Parse the markdown
      const tokens = marked.lexer(noteContent);

      // Create a new jsPDF instance
      const pdf = new jsPDF();

      let yOffset = 10;
      const lineHeight = 7;
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.width;

      tokens.forEach((token) => {
        switch (token.type) {
          case 'heading':
            pdf.setFontSize(24 - token.depth * 2);
            pdf.setFont('', 'bold');
            yOffset += lineHeight;
            pdf.text(token.text, margin, yOffset);
            yOffset += lineHeight;
            break;
          case 'paragraph':
            pdf.setFontSize(12);
            pdf.setFont('', 'normal');
            const lines = pdf.splitTextToSize(token.text, pageWidth - 2 * margin);
            lines.forEach((line: string) => {
              if (yOffset > pdf.internal.pageSize.height - margin) {
                pdf.addPage();
                yOffset = margin;
              }
              pdf.text(line, margin, yOffset);
              yOffset += lineHeight;
            });
            yOffset += lineHeight / 2;
            break;
          case 'list':
            pdf.setFontSize(12);
            pdf.setFont('', 'normal');
            token.items.forEach((item: { text: string }, index: number) => {
              if (yOffset > pdf.internal.pageSize.height - margin) {
                pdf.addPage();
                yOffset = margin;
              }
              const bullet = token.ordered ? `${index + 1}.` : '•';
              const itemText = `${bullet} ${item.text}`;
              const lines = pdf.splitTextToSize(itemText, pageWidth - 3 * margin);
              lines.forEach((line: string, lineIndex: number) => {
                pdf.text(line, lineIndex === 0 ? margin : margin * 2, yOffset);
                yOffset += lineHeight;
              });
            });
            yOffset += lineHeight / 2;
            break;
          // Add more cases for other markdown elements as needed
        }
      });

      // Save the PDF
      pdf.save(`${noteTitle}.pdf`);
    } catch (error) {
      console.error('Failed to download note:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-10 text-gray-400 hover:text-green-500 hover:bg-muted-foreground/20 transition-colors"
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