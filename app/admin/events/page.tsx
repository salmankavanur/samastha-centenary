"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminEventsList from "@/components/admin-events-list"
import AdminEventForm from "@/components/admin-event-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminEventsPage() {
  const searchParams = useSearchParams()
  const action = searchParams.get("action")
  const [activeTab, setActiveTab] = useState("all")

  // If we're creating or editing an event, show the form
  if (action === "create" || action === "edit") {
    return <AdminEventForm />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <Button asChild className="hover:text-white">
          <Link href="/admin/events?action=create">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 mb-6">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <AdminEventsList filter="all" key="all-events" />
        </TabsContent>
        <TabsContent value="upcoming">
          <AdminEventsList filter="upcoming" key="upcoming-events" />
        </TabsContent>
        <TabsContent value="published">
          <AdminEventsList filter="published" key="published-events" />
        </TabsContent>
        <TabsContent value="drafts">
          <AdminEventsList filter="drafts" key="draft-events" />
        </TabsContent>
        <TabsContent value="featured">
          <AdminEventsList filter="featured" key="featured-events" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
