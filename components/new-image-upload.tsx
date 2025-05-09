"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  existingImageUrl?: string
  bucketType: "news" | "events"
}

export default function NewImageUpload({ onImageUploaded, existingImageUrl, bucketType }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to handle file selection and upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error state
    setUploadError(null)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPEG, PNG, etc.)")
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Please upload an image smaller than 5MB")
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

      // Create form data for upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucketType", bucketType)

      // Use our custom API endpoint for upload
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const data = await response.json()
      console.log("Image uploaded successfully:", data.imageUrl)

      // Call the callback with the image URL
      onImageUploaded(data.imageUrl)

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
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
    setUploadError(null)
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
          {uploadError && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <p className="text-white text-center px-4">{uploadError}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md bg-muted/20">
          {uploadError ? (
            <>
              <p className="text-destructive mb-2">{uploadError}</p>
              <Button variant="outline" size="sm" onClick={() => setUploadError(null)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No image selected</p>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
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
