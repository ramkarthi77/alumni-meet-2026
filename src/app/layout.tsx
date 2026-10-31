import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/layout/Providers'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title:       'Alumni Meet 2026',
  description: 'Reconnect. Celebrate. Cherish Our Memories.',
  viewport:    'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
