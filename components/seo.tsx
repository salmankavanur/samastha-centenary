"use client"

import Head from "next/head"
import { useRouter } from "next/router"

interface SEOProps {
  title?: string
  description?: string
  image?: string
  article?: boolean
  keywords?: string[]
}

export default function SEO({
  title = "SUHBA Countdown",
  description = "Suffa Dars Coordination under Alathurpadi Dars",
  image = "/placeholder.svg",
  article = false,
  keywords = ["SUHBA", "Countdown", "Suffa Dars", "Alathurpadi Dars"],
}: SEOProps) {
  const router = useRouter()
  const canonicalUrl = `https://suhba-countdown.vercel.app${router.asPath}`
  const siteUrl = "https://suhba-countdown.vercel.app"

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${image}`} />
    </Head>
  )
}
