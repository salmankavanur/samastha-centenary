import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, MapPin, ArrowLeft, Share2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getEventById } from "@/lib/db/events"
import { formatDate } from "@/lib/utils"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id)

  if (!event) {
    return {
      title: "Event Not Found - SUHBA Countdown",
      description: "The requested event could not be found.",
    }
  }

  return {
    title: `${event.title} - SUHBA Countdown`,
    description: event.description,
  }
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id)

  if (!event || !event.published) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>

          {event.imageUrl && (
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-auto object-cover"
              />
              {event.featured && <Badge className="absolute top-4 right-4 bg-yellow-500">Featured</Badge>}
            </div>
          )}

          <h1 className="mb-4 text-3xl font-bold md:text-4xl malayalam-title">{event.title}</h1>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">
                {formatDate(new Date(event.startDate))}
                {event.endDate && ` - ${formatDate(new Date(event.endDate))}`}
              </span>
            </div>

            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              <span className="font-medium">Location:</span>
              <span className="ml-2">{event.location}</span>
            </div>

            <div className="flex items-center text-sm">
              <span className="font-medium">Organized by:</span>
              <span className="ml-2">{event.organizer}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8 malayalam-content">
            {event.description.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {event.registrationRequired && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-2">Registration</h3>
              <p className="mb-4">Registration is required for this event.</p>
              {event.maxAttendees && <p className="mb-4">Maximum attendees: {event.maxAttendees}</p>}
              {event.registrationUrl ? (
                <Button asChild>
                  <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                    Register Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              ) : (
                <p>Please contact the organizer for registration details.</p>
              )}
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>

            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
