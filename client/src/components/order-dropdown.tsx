'use client'

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrderDropdownProps = {
  onValueChange?: (value: "asc" | "desc") => void
}

export function OrderDropdown({ onValueChange }: OrderDropdownProps) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-[120px] bg-gray-200 text-gray-700 border-gray-300 rounded-full h-7 px-2 text-xs focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Order" />
      </SelectTrigger>
      <SelectContent
        className="bg-gray-200 rounded-[9px] min-w-[100px] p-0 border-0"
        align="end"
        sideOffset={-4}
      >
        <div className="justify-start">
          <SelectItem
            value="asc"
            className="text-left text-xs py-1.5 rounded-sm focus:bg-gray-300 focus:text-gray-700 data-[state=checked]:bg-gray-300 data-[state=checked]:text-gray-700"
          >
            Edited New
          </SelectItem>
          <SelectItem
            value="desc"
            className="text-left text-xs py-1.5 rounded-sm focus:bg-gray-300 focus:text-gray-700 data-[state=checked]:bg-gray-300 data-[state=checked]:text-gray-700"
          >
            Edited Old
          </SelectItem>
        </div>
      </SelectContent>
    </Select>
  )
}