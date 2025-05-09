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

interface NewsFormData {
  title: string
  summary: string
  content: string
  imageUrl: string
  published: boolean
  featured: boolean
  tags: string
}

export default function AdminNewsForm() {
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    summary: "",
    content: "",
    imageUrl: "",
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
      fetchNewsItem(id)
    }
  }, [action, id])

  async function fetchNewsItem(id: string) {
    setLoading(true)
    try {
      // Add cache-busting parameter
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/news/${id}?_=${timestamp}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch news")

      const data = await response.json()
      console.log("Fetched news item:", data)

      setFormData({
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl || "",
        published: data.published,
        featured: data.featured,
        tags: data.tags?.join(", ") || "",
      })
    } catch (error) {
      console.error("Error fetching news:", error)
      toast({
        title: "Error",
        description: "Failed to load news. Please try again.",
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

      const payload = {
        ...formData,
        tags,
        author: "Suhba Admin", // Add default author
        authorId: "admin", // Add default authorId
        createdAt: new Date().toISOString(),
        publishedAt: formData.published ? new Date().toISOString() : null,
      }

      console.log("Submitting news form:", payload)

      const url = isEdit ? `/api/news/${id}` : "/api/news"
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
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response:", errorData)
        throw new Error(errorData.error || `Failed to ${isEdit ? "update" : "create"} news`)
      }

      toast({
        title: "Success",
        description: `News ${isEdit ? "updated" : "created"} successfully`,
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

      router.push("/admin/news")
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} news:`, error)
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} news. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit News" : "Create News"}</CardTitle>
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
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              required
              className="malayalam-summary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              required
              className="malayalam-content"
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <AdminImageUpload
              onImageUploaded={handleImageUploaded}
              existingImageUrl={formData.imageUrl}
              bucketType="news"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="news, announcement, important"
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
            onClick={() => router.push("/admin/news")}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto hover:text-white">
            {loading ? "Saving..." : isEdit ? "Update News" : "Create News"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
