import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authOptions } from "@/lib/auth"
import { getUserByEmail } from "@/lib/db/users"
import { getContributionsByUserId } from "@/lib/db/contributions"
import EditProfileForm from "@/components/edit-profile-form"

export const metadata = {
  title: "My Profile - SUHBA Countdown",
  description: "View and manage your SUHBA countdown profile",
}

export default async function ProfilePage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    redirect("/login?callbackUrl=/profile")
  }

  // Get user details - with error handling
  let user
  try {
    user = await getUserByEmail(session.user.email)
  } catch (error) {
    console.error("Error fetching user:", error)
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="container px-4 py-8 mx-auto">
          <h1 className="mb-8 text-3xl font-bold">My Profile</h1>
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Profile</h2>
            <p>We encountered an error while loading your profile information.</p>
            <p className="mt-4 text-sm text-gray-500">Please try again later or contact support.</p>
          </div>
        </div>
      </main>
    )
  }

  if (!user || !user._id) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="container px-4 py-8 mx-auto">
          <h1 className="mb-8 text-3xl font-bold">My Profile</h1>
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-amber-500 mb-4">User Not Found</h2>
            <p>We couldn't find your user profile in our system.</p>
            <p className="mt-4 text-sm text-gray-500">Please try logging in again or contact support.</p>
          </div>
        </div>
      </main>
    )
  }

  // Get user contributions - with error handling
  let contributions = []
  try {
    contributions = await getContributionsByUserId(user._id)
  } catch (error) {
    console.error("Error fetching contributions:", error)
    // Continue with empty contributions
  }

  // Get initials for avatar fallback
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">My Profile</h1>

        <Tabs defaultValue="view">
          <TabsList className="mb-6">
            <TabsTrigger value="view">View Profile</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-1 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="mb-4">
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="text-4xl bg-primary/10">{initials}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p>{user.name}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p>{user.email}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Role</h3>
                      <Badge variant={user.role === "admin" ? "destructive" : "outline"}>{user.role}</Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      {user.isApproved || user.role === "admin" ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          Pending Approval
                        </Badge>
                      )}
                    </div>

                    {user.badge && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Badge</h3>
                        <Badge variant="secondary">{user.badge}</Badge>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                      <p>{new Date(user.joinedAt).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contributions</h3>
                      <p>{user.contributionsCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>My Contributions</CardTitle>
                    <CardDescription>Contributions you've submitted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contributions.length === 0 ? (
                      <p className="text-gray-500">You haven't submitted any contributions yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {contributions.map((contribution) => (
                          <Card key={contribution._id?.toString()}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm text-gray-500">
                                  {new Date(contribution.createdAt).toLocaleDateString()}
                                </p>
                                <Badge
                                  variant={
                                    contribution.status === "approved"
                                      ? "default"
                                      : contribution.status === "rejected"
                                        ? "destructive"
                                        : "outline"
                                  }
                                >
                                  {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="mb-2">{contribution.content}</p>
                              {contribution.source && (
                                <p className="text-sm text-gray-500">Source: {contribution.source}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <EditProfileForm user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
