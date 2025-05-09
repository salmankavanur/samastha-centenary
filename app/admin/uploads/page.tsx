import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import AdminUploadForm from "@/components/admin-upload-form"

export const metadata = {
  title: "Upload Status - SUHBA Countdown",
  description: "Upload new status posts to the SUHBA Countdown calendar",
}

export default function AdminUploadsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Upload Status</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <AdminUploadForm />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload Guidelines</CardTitle>
              <CardDescription>Best practices for status uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Image Requirements</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>High-resolution image (1080x1350px recommended)</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Supported formats: JPG, PNG</li>
                  <li>Clear, readable text</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Content Guidelines</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Keep titles concise and descriptive</li>
                  <li>Provide detailed descriptions</li>
                  <li>Include relevant tags for better searchability</li>
                  <li>Ensure content is accurate and appropriate</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Scheduling Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Plan content in advance for important dates</li>
                  <li>Maintain consistent posting schedule</li>
                  <li>Consider time zones when scheduling posts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
