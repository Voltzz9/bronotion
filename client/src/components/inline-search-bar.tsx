"use client"

import { useState } from 'react'
import { Search } from 'lucide-react'

export default function InlineSearchBar() {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the search action
    console.log('Searching for:', query)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-14 pl-3 pr-10 py-4 rounded-md border-none transition-all duration-300"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-md bg-transparent transition-colors duration-300"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </button>
      </div>
    </form>
  )
}