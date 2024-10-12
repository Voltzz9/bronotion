import { useState, useEffect, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

const URL = process.env.NEXT_PUBLIC_API_URL

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!URL) {
      console.error('API URL is not defined')
      return
    }

    const newSocket = io(URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('connect_error', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const joinNote = useCallback((noteId: string, userId: string) => {
    if (socket && isConnected) {
      socket.emit('join-note', { noteId, userId })
    } else {
      console.error('Socket is not connected. Unable to join note.')
    }
  }, [socket, isConnected])

  const leaveNote = useCallback((noteId: string, userId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-note', { noteId, userId })
    } else {
      console.error('Socket is not connected. Unable to leave note.')
    }
  }, [socket, isConnected])

  const updateNote = useCallback((noteId: string, content: string) => {
    if (socket && isConnected) {
      console.log(`Updating note: ${noteId}`)
      socket.emit('update-note', { noteId, content })
    } else {
      console.error('Socket is not connected. Unable to update note.')
    }
  }, [socket, isConnected])

  return { socket, isConnected, joinNote, leaveNote, updateNote }
}