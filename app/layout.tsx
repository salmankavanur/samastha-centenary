import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Serif_Malayalam } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import NavBar from "@/components/nav-bar"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import ScrollToTop from "@/components/scroll-to-top"
import BackgroundSync from "@/components/background-sync"
import AuthProvider from "@/components/auth-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const notoSerifMalayalam = Noto_Serif_Malayalam({
  weight: ["400", "700"],
  subsets: ["latin", "malayalam"],
  variable: "--font-noto-serif-malayalam",
})

export const metadata: Metadata = {
  title: "SUHBA - Suffa Dars Coordination Countdown",
  description: "300-day countdown calendar for Suffa Dars Coordination under Alathurpadi Dars",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SUHBA Countdown",
  },
    
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} ${notoSerifMalayalam.variable} pb-16 md:pb-0`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <NavBar />
            {children}
            <MobileBottomNav />
            <ScrollToTop />
            <BackgroundSync />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
