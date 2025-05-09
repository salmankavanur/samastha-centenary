"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  type: "contribution" | "user_registration" | "post_upload" | "user_approval"
  user: {
    name: string
    avatar?: string
  }
  description: string
  timestamp: string
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch from API
    // For now, using mock data
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "contribution",
        user: {
          name: "Ahmed Hassan",
          avatar: "/abstract-geometric-shapes.png",
        },
        description: "Submitted a new contribution",
        timestamp: "10 minutes ago",
      },
      {
        id: "2",
        type: "user_registration",
        user: {
          name: "Fatima Ali",
          avatar: "/diverse-woman-portrait.png",
        },
        description: "Registered a new account",
        timestamp: "2 hours ago",
      },
      {
        id: "3",
        type: "post_upload",
        user: {
          name: "Admin",
          avatar: "/admin-interface.png",
        },
        description: "Uploaded Day 245 status",
        timestamp: "Yesterday",
      },
      {
        id: "4",
        type: "user_approval",
        user: {
          name: "Admin",
          avatar: "/admin-interface.png",
        },
        description: "Approved Yusuf Khan's account",
        timestamp: "2 days ago",
      },
    ]

    setActivities(mockActivities)
    setLoading(false)
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{activity.user.name}</p>
                    <ActivityBadge type={activity.type} />
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityBadge({ type }: { type: Activity["type"] }) {
  switch (type) {
    case "contribution":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Contribution
        </Badge>
      )
    case "user_registration":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Registration
        </Badge>
      )
    case "post_upload":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Upload
        </Badge>
      )
    case "user_approval":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Approval
        </Badge>
      )
    default:
      return null
  }
}
