'use client'

import React, { useState, useEffect } from 'react'
import { marked } from 'marked'

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Hello, world!')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    const renderMarkdown = async () => {
      const rendered = await marked(markdown)
      setPreview(rendered)
    }

    renderMarkdown()
  }, [markdown])

  return (
    <div className="flex flex-col h-screen">
      <div 
        className="flex-1 p-4 overflow-auto" 
        dangerouslySetInnerHTML={{ __html: preview }}
      />
      <textarea
        className="flex-1 p-4 resize-none border-t"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Enter Markdown here..."
      />
    </div>
  )
}