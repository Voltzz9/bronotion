'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const useTypingAnimation = (text: string, minDelay: number = 100, maxDelay: number = 300, startDelay: number = 0) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex === 0) {
      const timeout = setTimeout(() => {
        setCurrentIndex(1)
      }, startDelay)
      return () => clearTimeout(timeout)
    }

    if (currentIndex <= text.length) {
      const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay
      const timeout = setTimeout(() => {
        if (currentIndex === text.length) {
          setDisplayText(text)
          setIsComplete(true)
        } else {
          setDisplayText(prev => prev + text[currentIndex - 1])
          setCurrentIndex(prev => prev + 1)
        }
      }, randomDelay)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, minDelay, maxDelay, startDelay, text])

  return { displayText, isComplete }
}

const Cursor = ({ name, color }: { name: string; color: string }) => (
  <div className={`absolute -top-6 whitespace-nowrap px-2 py-1 rounded ${color} text-white text-xs`}>
    {name}
  </div>
)

interface RealTimeNoteCollaborationProps {
  text1: string
  text2: string
}

export function RealTimeNoteCollaborationComponent({ text1, text2 }: RealTimeNoteCollaborationProps) {
  const { displayText: displayText1, isComplete: isText1Complete } = useTypingAnimation(text1, 100, 300)
  const { displayText: displayText2, isComplete: isText2Complete } = useTypingAnimation(text2, 100, 300, 3000)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative text-4xl font-bold text-gray-800">
        <span>{displayText1}</span>
        <AnimatePresence>
          {!isText1Complete && (
            <motion.div
              className="inline-block relative"
              initial={{ opacity: 1, left: 0 }}
              animate={{ left: `${displayText1.length * 0.6}em` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <Cursor name="user1" color="bg-blue-500" />
              <motion.span
                className="w-0.5 h-6 bg-blue-500 inline-block"
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {isText1Complete && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            transition={{ duration: 0.5 }}
          >
            {" "}
          </motion.span>
        )}
        <span>{displayText2}</span>
        <AnimatePresence>
          {!isText2Complete && (
            <motion.div
              className="inline-block relative"
              initial={{ opacity: 0, left: `${(displayText1.length + 1) * 0.6}em` }}
              animate={{ opacity: 1, left: `${(displayText1.length + 1 + displayText2.length) * 0.6}em` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "linear", delay: 3 }}
            >
              <Cursor name="user2" color="bg-green-500" />
              <motion.span
                className="w-0.5 h-6 bg-green-500 inline-block"
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}