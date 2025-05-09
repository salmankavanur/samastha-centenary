import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminNewsList from "@/components/admin-news-list"
import AdminNewsForm from "@/components/admin-news-form"

export const metadata = {
  title: "Manage News - SUHBA Countdown",
  description: "Manage news articles for SUHBA Countdown",
}

export default function AdminNewsPage({ searchParams }: { searchParams: { action?: string; id?: string } }) {
  const action = searchParams.action
  const isCreatingOrEditing = action === "create" || action === "edit"

  if (isCreatingOrEditing) {
    return <AdminNewsForm />
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage News</h1>
        <Button asChild>
          <Link href="/admin/news?action=create">
            <Plus className="w-4 h-4 mr-2" />
            Add News
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Suspense fallback={<div>Loading news...</div>}>
            <AdminNewsList filter="all" />
          </Suspense>
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <Suspense fallback={<div>Loading published news...</div>}>
            <AdminNewsList filter="published" />
          </Suspense>
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <Suspense fallback={<div>Loading drafts...</div>}>
            <AdminNewsList filter="drafts" />
          </Suspense>
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <Suspense fallback={<div>Loading featured news...</div>}>
            <AdminNewsList filter="featured" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
