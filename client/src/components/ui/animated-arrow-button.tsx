"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion" // Import framer-motion for animation
import { TaggedNotesPanelComponent } from '@/components/tagged-notes-panel'
export default function Component() {
  const [isRightArrow, setIsRightArrow] = useState(true)
  const [isPanelOpen, setIsPanelOpen] = useState(false) // State to handle the side panel

  const handleClick = () => {
    setIsRightArrow(!isRightArrow)
    setIsPanelOpen(!isPanelOpen) // Toggle the side panel when arrow is clicked
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant="link"
        className="flex items-center space-x-2 group z-2"
      >
        <ArrowRight
          className={`h-8 w-8 transition-transform duration-300 ease-in-out ${isRightArrow ? 'rotate-0' : 'rotate-180'
            }`}
        />
      </Button>

      {/* Side Panel */}
      <motion.div
        initial={{ x: '100%' }} // Start off-screen to the left
        animate={{ x: isPanelOpen ? 0 : '100%' }} // Slide in when panel is open
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-20 right-0 h-[calc(100%-64px)] w-64 bg-gray-100 shadow-lg z-30"

      >
        <div className="z-40">
          <TaggedNotesPanelComponent />
        </div>
      </motion.div>
    </>
  )
}
