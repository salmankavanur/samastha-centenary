import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ContributorBadgeProps {
  name: string
  avatarUrl: string
  badge: string
}

export default function ContributorBadge({ name, avatarUrl, badge }: ContributorBadgeProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{name}</p>
        <Badge variant="outline" className="text-xs">
          {badge}
        </Badge>
      </div>
    </div>
  )
}
