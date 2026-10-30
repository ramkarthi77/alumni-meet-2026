import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rateLimit'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 hours
  pages: {
    signIn: '/organizer/login',
    error:  '/organizer/login',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        secure:   process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Organizer Login',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // Rate-limit per IP
        const ip =
          (req as any)?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
          'unknown'
        const max = parseInt(process.env.RATE_LIMIT_LOGIN_MAX ?? '5', 10)
        if (!rateLimit(`login:${ip}`, { max, windowMs: 15 * 60 * 1000 })) {
          throw new Error('Too many login attempts. Please try again later.')
        }

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) throw new Error('Invalid credentials.')

        const organizer = await prisma.organizer.findUnique({
          where: { email: parsed.data.email },
        })
        if (!organizer) throw new Error('Invalid email or password.')

        const match = await bcrypt.compare(parsed.data.password, organizer.passwordHash)
        if (!match) throw new Error('Invalid email or password.')

        // Update last login
        await prisma.organizer.update({
          where: { id: organizer.id },
          data:  { lastLoginAt: new Date() },
        })

        return { id: organizer.id, email: organizer.email, name: organizer.name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
}
