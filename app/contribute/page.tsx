import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContributionForm from "@/components/contribution-form"
import { authOptions } from "@/lib/auth"
import { getUserByEmail } from "@/lib/db/users"

export const metadata = {
  title: "Contribute - SUHBA Countdown",
  description: "Contribute content to the SUHBA countdown calendar",
}

export default async function ContributePage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/contribute")
  }

  // Get user details
  const user = await getUserByEmail(session.user.email!)

  // Check if user is approved
  if (user && !user.isApproved && user.role === "contributor") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Home
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Contribute Content</h1>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Account Pending Approval</CardTitle>
              <CardDescription>Your account is waiting for admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Thank you for registering! Your account is currently pending approval from our administrators. Once
                approved, you'll be able to contribute content to the SUHBA countdown calendar.
              </p>
              <p>Please check back later or contact the administrator for more information.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Contribute Content</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Guidelines</CardTitle>
              <CardDescription>Help us make the countdown more meaningful by contributing content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium">What can you contribute?</h3>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Hadith related to knowledge and education</li>
                  <li>Inspirational quotes from Islamic scholars</li>
                  <li>Short reflections on the importance of education</li>
                  <li>Historical facts about Islamic educational institutions</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Contribution Process</h3>
                <ol className="ml-6 list-decimal space-y-1">
                  <li>Submit your content through the form</li>
                  <li>Our team will review your submission</li>
                  <li>If approved, your content will be featured on the calendar</li>
                  <li>You'll receive credit as a contributor</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Contributor Badges</h3>
                <p>Active contributors can earn badges:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Rising Contributor: 3+ approved submissions</li>
                  <li>Top Contributor: 10+ approved submissions</li>
                  <li>Verified Scholar: For recognized scholars and educators</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <ContributionForm userId={user?._id?.toString()} />
        </div>
      </div>
    </main>
  )
}
