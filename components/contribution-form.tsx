"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ContributionFormProps {
  userId?: string
}

export default function ContributionForm({ userId }: ContributionFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const content = formData.get("content") as string
      const source = formData.get("source") as string

      if (!userId) {
        throw new Error("You must be logged in to contribute")
      }

      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          content,
          source: source || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit contribution")
      }

      toast({
        title: "Contribution submitted",
        description: "Thank you for your contribution! Our team will review it shortly.",
      })

      // Reset form
      formRef.current?.reset()
    } catch (error) {
      console.error("Error submitting contribution:", error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your contribution.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Contribution</CardTitle>
        <CardDescription>Share your knowledge and insights for the countdown</CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Your Contribution</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter a hadith, quote, or reflection (max 300 characters)"
              className="min-h-[120px]"
              maxLength={300}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source (if applicable)</Label>
            <Textarea
              id="source"
              name="source"
              placeholder="Enter the source of your contribution"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Contribution"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
