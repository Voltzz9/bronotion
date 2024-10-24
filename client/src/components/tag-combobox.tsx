"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TagComboboxProps {
  initTags: string[];
  selectedTags: string[];
  noteId: string;
  onTagToggle: (tagName: string, tagId?: string) => void;
  handleCreateTag: (tag: string) => void;
}

export const TagCombobox: React.FC<TagComboboxProps> = ({ initTags, selectedTags, onTagToggle, handleCreateTag }) => {
  const [open, setOpen] = React.useState(false)
  const [tags, setTags] = React.useState(initTags)
  const [inputValue, setInputValue] = React.useState("")

  const createTag = (label: string) => {
    if (label.trim() === "") return
    handleCreateTag(label.trim())
    setInputValue("")
    setOpen(false)
  }

  React.useEffect(() => {
    setTags(initTags)
  }, [initTags])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          tabIndex={0}
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          aria-label="Add tag"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search or create tag..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {inputValue.trim() && (
              <CommandEmpty>
                <Button
                  tabIndex={0}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    createTag(inputValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createTag(inputValue);
                    }
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{inputValue}&quot;
                </Button>
              </CommandEmpty>
            )}
            <CommandGroup heading="Existing tags">
              {tags.map((tag) => (
                <CommandItem
                  tabIndex={0}
                  key={tag}
                  value={tag}
                  onSelect={() => {
                    onTagToggle(tag)
                    setOpen(false)
                  }}
                  className="focus:bg-gray-200 focus:text-primary transition-colors duration-200 outline-none"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}