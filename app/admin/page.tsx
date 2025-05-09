import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, Users, Settings } from "lucide-react"
import DashboardStats from "@/components/dashboard-stats"
import DashboardCharts from "@/components/dashboard-charts"
import RecentActivities from "@/components/recent-activities"
import UpcomingEvents from "@/components/upcoming-events"
import PopularPosts from "@/components/popular-posts"

export const metadata = {
  title: "Admin Dashboard - SUHBA Countdown",
  description: "Admin dashboard for SUHBA Countdown",
}

export default function AdminDashboardPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/uploads">
              <Upload className="w-4 h-4 mr-2" />
              Upload Status
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/admin/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center">Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            </TabsList>
            <TabsContent value="analytics" className="p-0 mt-6">
              <DashboardCharts />
            </TabsContent>
            <TabsContent value="activities" className="p-0 mt-6">
              <RecentActivities />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/uploads">
                  <Plus className="w-4 h-4 mr-2" />
                  New Status Post
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/contributions">
                  <Plus className="w-4 h-4 mr-2" />
                  Review Contributions
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>

          <UpcomingEvents />
          <PopularPosts />
        </div>
      </div>
    </div>
  )
}
