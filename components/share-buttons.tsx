"use client"

import { useState } from "react"
import { Share2, Copy, Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonsProps {
  title: string
  url?: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const shareUrl = url || typeof window !== "undefined" ? window.location.href : ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)

    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const text = `${title} - Check out this post from SUHBA Countdown: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={handleCopyLink}>
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </>
        )}
      </Button>

      <Button variant="outline" onClick={handleShareWhatsApp}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Share on WhatsApp
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            More Options
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
            }
          >
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
                "_blank",
              )
            }
          >
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(
                `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
                "_blank",
              )
            }
          >
            Telegram
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
