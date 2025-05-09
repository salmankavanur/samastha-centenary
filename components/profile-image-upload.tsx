"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Loader2, X } from "lucide-react"

interface ProfileImageUploadProps {
  userId: string
  initialImageUrl?: string | null
  onImageUpdate: (url: string) => void
}

export default function ProfileImageUpload({ userId, initialImageUrl, onImageUpdate }: ProfileImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload to server
      const response = await fetch(`/api/users/${userId}/profile-image`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to upload image")
      }

      const data = await response.json()

      // Update state
      setImageUrl(data.imageUrl)
      setPreviewUrl(null)
      onImageUpdate(data.imageUrl)

      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully",
      })
    } catch (error) {
      console.error("Error uploading profile image:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!imageUrl) return

    setIsUploading(true)

    try {
      // Delete from server
      const response = await fetch(`/api/users/${userId}/profile-image`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to remove image")
      }

      // Update state
      setImageUrl(null)
      onImageUpdate("")

      toast({
        title: "Profile image removed",
        description: "Your profile image has been removed successfully",
      })
    } catch (error) {
      console.error("Error removing profile image:", error)
      toast({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Failed to remove profile image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {previewUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden">
                <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            ) : (
              <Avatar className="w-32 h-32">
                <AvatarImage src={imageUrl || undefined} />
                <AvatarFallback className="text-4xl bg-primary/10">
                  {userId.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Camera className="w-4 h-4 mr-2" />
              {imageUrl ? "Change" : "Upload"}
            </Button>

            {imageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isUploading}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

          <p className="mt-4 text-xs text-center text-muted-foreground">
            Upload a profile picture (max 5MB). <br />
            JPG, PNG, and GIF formats are supported.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
