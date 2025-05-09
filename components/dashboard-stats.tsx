"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react"

interface DashboardStatsData {
  totalPosts: number
  pendingContributions: number
  totalUsers: number
  activeUsers: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalPosts: 0,
    pendingContributions: 0,
    totalUsers: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Posts"
        value={loading ? "Loading..." : stats.totalPosts.toString()}
        icon={<FileText className="h-6 w-6 text-blue-500" />}
        description="Total status posts"
        trend={"+5% from last month"}
        trendUp={true}
      />
      <StatsCard
        title="Pending Contributions"
        value={loading ? "Loading..." : stats.pendingContributions.toString()}
        icon={<MessageSquare className="h-6 w-6 text-amber-500" />}
        description="Awaiting approval"
        trend={loading ? "" : stats.pendingContributions > 5 ? "Needs attention" : "All good"}
        trendUp={stats.pendingContributions > 5}
      />
      <StatsCard
        title="Total Users"
        value={loading ? "Loading..." : stats.totalUsers.toString()}
        icon={<Users className="h-6 w-6 text-green-500" />}
        description="Registered users"
        trend={"+12% from last month"}
        trendUp={true}
      />
      <StatsCard
        title="Active Users"
        value={loading ? "Loading..." : stats.activeUsers.toString()}
        icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
        description="Last 7 days"
        trend={"+3% from last week"}
        trendUp={true}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description: string
  trend?: string
  trendUp?: boolean
}

function StatsCard({ title, value, icon, description, trend, trendUp }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && <p className={`text-xs mt-2 ${trendUp ? "text-green-500" : "text-red-500"}`}>{trend}</p>}
      </CardContent>
    </Card>
  )
}
