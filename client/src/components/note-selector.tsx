'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NoteSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteSelector({ value, onChange }: NoteSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select notes to view" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Notes</SelectItem>
        <SelectItem value="own">My Notes</SelectItem>
        <SelectItem value="shared">Shared with Me</SelectItem>
      </SelectContent>
    </Select>
  )
}