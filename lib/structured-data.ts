export function generateEventStructuredData(event: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    location: {
      "@type": "Place",
      name: event.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.location,
      },
    },
    image: event.imageUrl || "/placeholder.svg",
    organizer: {
      "@type": "Organization",
      name: event.organizer || "SUHBA Countdown",
      url: "https://suhba-countdown.vercel.app",
    },
  }
}

export function generateNewsArticleStructuredData(news: any) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    image: news.imageUrl || "/placeholder.svg",
    datePublished: news.publishedAt,
    dateModified: news.updatedAt || news.publishedAt,
    author: {
      "@type": "Person",
      name: news.author,
    },
    publisher: {
      "@type": "Organization",
      name: "SUHBA Countdown",
      logo: {
        "@type": "ImageObject",
        url: "https://suhba-countdown.vercel.app/logo.png",
      },
    },
    description: news.summary,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://suhba-countdown.vercel.app/news/${news._id}`,
    },
  }
}

export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://suhba-countdown.vercel.app${item.url}`,
    })),
  }
}
