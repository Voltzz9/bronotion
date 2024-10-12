'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NoteSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteSelector({ value, onChange }: NoteSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]" tabIndex={0} >
        <SelectValue placeholder="Select notes to view" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="focus:bg-gray-200" tabIndex={0} value="all">All Notes</SelectItem>
        <SelectItem className="focus:bg-gray-200" tabIndex={0} value="own">My Notes</SelectItem>
        <SelectItem className="focus:bg-gray-200" tabIndex={0} value="shared">Shared with Me</SelectItem>
      </SelectContent>
    </Select>
  )
}