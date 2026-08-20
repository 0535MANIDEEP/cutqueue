'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const publicLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#how-it-works', label: 'How It Works' },
]

export function Header() {
  const { data: session } = useSession()
  const role = session?.user?.role as string | undefined

  const getDashboardLabel = () => {
    switch (role) {
      case 'ADMIN': return 'Admin'
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
                <Link href={getDashboardHref()}>
                  <Button variant="ghost" size="sm">{getDashboardLabel()}</Button>
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
            onClick={() => {
              const menu = document.getElementById('mobile-menu')
              if (menu) menu.classList.toggle('hidden')
            }}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div id="mobile-menu" className="hidden md:hidden py-4 border-t border-[#2A3F3A]/50">
          <nav className="flex flex-col gap-2">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-[#EFE9DA]/70 hover:text-[#EFE9DA] hover:bg-[#1E2E29] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <Link href={getDashboardHref()} className="px-3 py-2 text-[#EFE9DA]/70 hover:text-[#EFE9DA] hover:bg-[#1E2E29] rounded-lg transition-colors">
                {getDashboardLabel()}
              </Link>
            )}
            <div className="flex gap-2 mt-2 pt-2 border-t border-[#2A3F3A]/50">
              {session ? (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/auth/signin" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
