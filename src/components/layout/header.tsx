'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const publicLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/queue', label: 'Live Queue' },
]

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const role = session?.user?.role as string | undefined

  useEffect(() => {
    if (session?.user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {})
    }
  }, [session])

  const getDashboardLabel = () => {
    switch (role) {
      case 'ADMIN': return 'Admin Panel'
      case 'BUSINESS_OWNER': return 'Dashboard'
      case 'STAFF': return 'Dashboard'
      default: return 'My Bookings'
    }
  }

  const getDashboardHref = () => {
    switch (role) {
      case 'ADMIN': return '/admin'
      case 'BUSINESS_OWNER': return '/dashboard/owner'
      case 'STAFF': return '/dashboard/staff'
      default: return '/dashboard/customer'
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F1B17]/90 backdrop-blur-md border-b border-[#2A3F3A]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8B547] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0F1B17]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#EFE9DA]">
              Queue<span className="text-[#E8B547]">Forge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#EFE9DA]/70 hover:text-[#EFE9DA] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">Admin</Button>
                  </Link>
                )}
                <Link href="/reviews">
                  <Button variant="ghost" size="sm">Reviews</Button>
                </Link>
                <Link href="/complaints">
                  <Button variant="ghost" size="sm">Complaints</Button>
                </Link>
                <Link href={getDashboardHref()}>
                  <Button variant="ghost" size="sm">{getDashboardLabel()}</Button>
                </Link>
                <Link href="/notifications" className="relative">
                  <Button variant="ghost" size="sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E8B547] text-[#0F1B17] text-xs flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-[#EFE9DA]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#2A3F3A]/50">
            <nav className="flex flex-col gap-2">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-[#EFE9DA]/70 hover:text-[#EFE9DA] hover:bg-[#1E2E29] rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {session && (
                <>
                  <Link href="/reviews" className="px-3 py-2 text-[#EFE9DA]/70 hover:text-[#EFE9DA] hover:bg-[#1E2E29] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Reviews
                  </Link>
                  <Link href="/complaints" className="px-3 py-2 text-[#EFE9DA]/70 hover:text-[#EFE9DA] hover:bg-[#1E2E29] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Complaints
                  </Link>
                  <Link href="/notifications" className="px-3 py-2 text-[#EFE9DA]/70 hover:text-[#EFE9DA] hover:bg-[#1E2E29] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </Link>
                </>
              )}
              <div className="flex gap-2 mt-2 pt-2 border-t border-[#2A3F3A]/50">
                {session ? (
                  <>
                    {role === 'ADMIN' && (
                      <Link href="/admin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full">Admin</Button>
                      </Link>
                    )}
                    <Link href={getDashboardHref()} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">{getDashboardLabel()}</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => signOut({ callbackUrl: '/' })}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
