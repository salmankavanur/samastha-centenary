"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import AdminImageUpload from "@/components/admin-image-upload"

interface EventFormData {
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  imageUrl: string
  registrationRequired: boolean
  registrationUrl: string
  maxAttendees: string
  published: boolean
  featured: boolean
  tags: string
}

export default function AdminEventForm() {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    imageUrl: "",
    registrationRequired: false,
    registrationUrl: "",
    maxAttendees: "",
    published: false,
    featured: false,
    tags: "",
  })
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get("action")
  const id = searchParams.get("id")

  useEffect(() => {
    if (action === "edit" && id) {
      setIsEdit(true)
      fetchEventItem(id)
    }
  }, [action, id])

  async function fetchEventItem(id: string) {
    setLoading(true)
    try {
      // Add cache-busting parameter
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/events/${id}?_=${timestamp}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch event")

      const data = await response.json()
      console.log("Fetched event item:", data)

      // Format dates for input fields
      const startDate = new Date(data.startDate)
      const formattedStartDate = startDate.toISOString().split("T")[0]

      let formattedEndDate = ""
      if (data.endDate) {
        const endDate = new Date(data.endDate)
        formattedEndDate = endDate.toISOString().split("T")[0]
      }

      setFormData({
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        imageUrl: data.imageUrl || "",
        registrationRequired: data.registrationRequired || false,
        registrationUrl: data.registrationUrl || "",
        maxAttendees: data.maxAttendees?.toString() || "",
        published: data.published,
        featured: data.featured,
        tags: data.tags?.join(", ") || "",
      })
    } catch (error) {
      console.error("Error fetching event:", error)
      toast({
        title: "Error",
        description: "Failed to load event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSwitchChange(name: string, checked: boolean) {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  function handleImageUploaded(imageUrl: string) {
    console.log("Image URL received in form:", imageUrl)
    setFormData((prev) => ({ ...prev, imageUrl }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Process tags
      const tags = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      // Process maxAttendees
      const maxAttendees = formData.maxAttendees ? Number.parseInt(formData.maxAttendees) : undefined

      const payload = {
        ...formData,
        tags,
        maxAttendees,
      }

      console.log("Submitting event form:", payload)

      const url = isEdit ? `/api/events/${id}` : "/api/events"
      const method = isEdit ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEdit ? "update" : "create"} event`)
      }

      toast({
        title: "Success",
        description: `Event ${isEdit ? "updated" : "created"} successfully`,
      })

      // Force revalidation of all relevant pages
      try {
        await fetch(`/api/force-refresh`, {
          method: "GET",
          cache: "no-store",
        })
        console.log("Force refresh triggered")
      } catch (revalidateError) {
        console.error("Error revalidating paths:", revalidateError)
      }

      router.push("/admin/events")
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} event:`, error)
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} event. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Event" : "Create Event"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="malayalam-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
              className="malayalam-content"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="malayalam-font"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <AdminImageUpload
              onImageUploaded={handleImageUploaded}
              existingImageUrl={formData.imageUrl}
              bucketType="events"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="registrationRequired"
              checked={formData.registrationRequired}
              onCheckedChange={(checked) => handleSwitchChange("registrationRequired", checked)}
            />
            <Label htmlFor="registrationRequired">Registration Required</Label>
          </div>

          {formData.registrationRequired && (
            <>
              <div className="space-y-2">
                <Label htmlFor="registrationUrl">Registration URL</Label>
                <Input
                  id="registrationUrl"
                  name="registrationUrl"
                  value={formData.registrationUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/register"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Maximum Attendees (Optional)</Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="100"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="event, workshop, important"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => handleSwitchChange("published", checked)}
            />
            <Label htmlFor="published">Published</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/events")}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto hover:text-white">
            {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
