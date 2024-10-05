"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Plus } from "lucide-react"
import Cropper from 'react-easy-crop'

interface UserIconUpdateProps {
  currentImageUrl: string
  username: string
  onUpdateImage: (croppedImage: Blob) => Promise<void>
}

export default function UserIconUpdate({ currentImageUrl, username, onUpdateImage }: UserIconUpdateProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ width: number; height: number; x: number; y: number } | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
        setIsCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: { width: number; height: number; x: number; y: number }) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = useCallback(async () => {
    if (previewUrl && croppedAreaPixels) {
      const image = document.createElement('img')
      image.src = previewUrl
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      return new Promise<Blob>((resolve) => {
        image.onload = () => {
          canvas.width = croppedAreaPixels.width
          canvas.height = croppedAreaPixels.height
          ctx?.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
          )
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
          }, 'image/jpeg')
        }
      })
    }
  }, [previewUrl, croppedAreaPixels])

  const handleSubmit = async () => {
    const croppedImage = await createCroppedImage()
    if (croppedImage) {
      await onUpdateImage(croppedImage)
      setSelectedFile(null)
      setPreviewUrl(null)
      setIsCropperOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleImageClick}
      >
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentImageUrl} alt={username} />
          <AvatarFallback>
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <Plus className="text-white h-8 w-8" />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="h-[300px] relative">
            {previewUrl && (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCropperOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Update Profile Picture</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}