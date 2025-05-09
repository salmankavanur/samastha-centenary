import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { getUserByEmail } from "@/lib/db/users"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key-change-this",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await getUserByEmail(credentials.email)

          if (!user || !user.passwordHash) {
            return null
          }

          // For admin users, check if they're approved
          if (user.role === "admin") {
            // Admin users don't need approval
          } else {
            // For contributor users, check if they're approved
            if (!user.isApproved) {
              throw new Error("Your account is pending approval. Please wait for admin approval.")
            }
          }

          // Check password
          const passwordMatch = await compare(credentials.password, user.passwordHash)

          if (!passwordMatch) {
            return null
          }

          return {
            id: user._id!.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatarUrl || null,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}
