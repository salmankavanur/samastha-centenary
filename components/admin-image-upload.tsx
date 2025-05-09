"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface AdminImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  existingImageUrl?: string
  bucketType: "news" | "events"
}

export default function AdminImageUpload({ onImageUploaded, existingImageUrl, bucketType }: AdminImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucketType", bucketType)

      console.log(`Uploading ${file.name} to ${bucketType} bucket...`)

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const data = await response.json()
      console.log("Upload successful:", data)

      setImageUrl(data.url)
      onImageUploaded(data.url)
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemoveImage() {
    setImageUrl(null)
    onImageUploaded("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleRetry() {
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative border rounded-md overflow-hidden">
          <div className="aspect-video relative">
            <Image src={`${imageUrl}?_=${Date.now()}`} alt="Preview" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs p-2 text-center">
            Image ready
          </div>
        </div>
      ) : uploadError ? (
        <div className="border border-red-300 rounded-md p-4 bg-red-50 dark:bg-red-900/20 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">{uploadError}</p>
          <Button type="button" variant="outline" onClick={handleRetry} className="mx-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload an image or drag and drop</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary mr-2"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
        </div>
      )}
    </div>
  )
}
