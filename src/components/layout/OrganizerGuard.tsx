'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function OrganizerGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    if (!session && pathname !== '/organizer/login') {
      router.push('/organizer/login')
    }
  }, [session, status, router, pathname])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#155e36] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session && pathname !== '/organizer/login') return null

  if (pathname === '/organizer/login') return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-[#0d3321] shadow-sm border-b border-[#c9a84c]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/organizer/dashboard" className="text-white font-semibold text-sm">
              🎓 Alumni Meet 2026
            </Link>
            <div className="hidden sm:flex gap-4">
              <NavLink href="/organizer/dashboard" label="Dashboard" />
              <NavLink href="/organizer/members"   label="Members" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs hidden sm:inline">
              {session?.user?.name || session?.user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: '/organizer/login' })}
            >
              Logout
            </Button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden flex px-4 pb-2 gap-4">
          <NavLink href="/organizer/dashboard" label="Dashboard" />
          <NavLink href="/organizer/members"   label="Members" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-white/80 hover:text-white text-sm transition-colors"
    >
      {label}
    </Link>
  )
}
