"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { uploadFile, STORAGE_BUCKETS } from "@/lib/supabase"

export default function AdminUploadForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const day = formData.get("day") as string
      const date = formData.get("date") as string
      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const imageHdFile = formData.get("imageHd") as File
      const imageWebFile = formData.get("imageWeb") as File
      const audioFile = formData.get("audio") as File
      const contributor = formData.get("contributor") as string

      // Upload files to Supabase Storage
      let imageHdUrl = null
      let imageWebUrl = null
      let audioUrl = null

      if (imageHdFile && imageHdFile.size > 0) {
        const filePath = `day-${day}/${Date.now()}-hd.${imageHdFile.name.split(".").pop()}`
        imageHdUrl = await uploadFile(STORAGE_BUCKETS.POSTERS_HD, filePath, imageHdFile)

        if (!imageHdUrl) {
          throw new Error("Failed to upload HD image")
        }
      }

      if (imageWebFile && imageWebFile.size > 0) {
        const filePath = `day-${day}/${Date.now()}-web.${imageWebFile.name.split(".").pop()}`
        imageWebUrl = await uploadFile(STORAGE_BUCKETS.POSTERS_WEB, filePath, imageWebFile)
      } else if (imageHdUrl) {
        // Use HD image URL if web image is not provided
        imageWebUrl = imageHdUrl
      }

      if (audioFile && audioFile.size > 0) {
        const filePath = `day-${day}/${Date.now()}.${audioFile.name.split(".").pop()}`
        audioUrl = await uploadFile(STORAGE_BUCKETS.AUDIO, filePath, audioFile)
      }

      // Create status post in MongoDB
      const response = await fetch("/api/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: Number.parseInt(day),
          date,
          title,
          description,
          imageHdUrl,
          imageWebUrl,
          audioUrl,
          contributedBy: contributor || null,
          isPublished: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create status post")
      }

      toast({
        title: "Status uploaded",
        description: `Day ${day} has been successfully uploaded.`,
      })

      // Reset form
      formRef.current?.reset()
    } catch (error) {
      console.error("Error uploading status:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading the status.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="day">Day Number</Label>
              <Input id="day" name="day" type="number" min="1" max="300" placeholder="Enter day number" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Enter status title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter status description"
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="imageHd">HD Image</Label>
              <Input id="imageHd" name="imageHd" type="file" accept="image/*" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageWeb">Web Image (Optional)</Label>
              <Input id="imageWeb" name="imageWeb" type="file" accept="image/*" />
              <p className="text-xs text-gray-500">If not provided, the HD image will be used</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio File (Optional)</Label>
            <Input id="audio" name="audio" type="file" accept="audio/*" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contributor">Contributor ID (Optional)</Label>
            <Input id="contributor" name="contributor" placeholder="Enter contributor ID if applicable" />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Status"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
