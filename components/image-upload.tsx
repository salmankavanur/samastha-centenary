"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { STORAGE_BUCKETS, uploadFile, initializeStorageBuckets } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  existingImageUrl?: string
  bucketName?: string
}

export default function ImageUpload({
  onImageUploaded,
  existingImageUrl,
  bucketName = STORAGE_BUCKETS.NEWS_IMAGES,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize storage buckets when component mounts
  useEffect(() => {
    async function init() {
      try {
        console.log("Initializing storage buckets...")
        const success = await initializeStorageBuckets()
        if (!success) {
          console.warn("Failed to initialize storage buckets")
          toast({
            title: "Storage initialization failed",
            description: "There might be issues with image uploads. Please try again or contact support.",
            variant: "destructive",
          })
        } else {
          console.log("Storage buckets initialized successfully")
        }
      } catch (error) {
        console.error("Error initializing storage:", error)
      } finally {
        setInitializing(false)
      }
    }

    init()
  }, [])

  // Set preview URL when existingImageUrl changes
  useEffect(() => {
    if (existingImageUrl) {
      setPreviewUrl(existingImageUrl)
    }
  }, [existingImageUrl])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      // Generate a unique file path
      const timestamp = new Date().getTime()
      const randomString = Math.random().toString(36).substring(2, 10)
      const fileName = `${timestamp}-${randomString}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const filePath = `${fileName}`

      console.log("Uploading image:", { bucket: bucketName, path: filePath, fileSize: file.size })

      // Upload to Supabase
      const imageUrl = await uploadFile(bucketName, filePath, file)

      if (!imageUrl) {
        throw new Error("Failed to upload image")
      }

      console.log("Image uploaded successfully:", imageUrl)

      // Call the callback with the image URL
      onImageUploaded(imageUrl)

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      // Reset preview if upload failed
      if (!existingImageUrl) {
        setPreviewUrl(null)
      } else {
        setPreviewUrl(existingImageUrl)
      }
    } finally {
      setUploading(false)
    }
  }

  function handleRemoveImage() {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageUploaded("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="image-upload">Image</Label>
        {previewUrl && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} className="text-destructive">
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {previewUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
          <img
            src={`${previewUrl}?_=${Date.now()}`} // Add cache-busting parameter
            alt="Preview"
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md bg-muted/20">
          <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No image selected</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading || initializing}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || initializing}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : initializing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : previewUrl ? (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Change Image
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
