'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const publicLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/queue/join?shop=demo', label: 'Live demo' },
]

export function Header() {
  const { data: session } = useSession()
  const role = session?.user?.role as string | undefined
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F0D]/85 backdrop-blur-xl border-b border-[#1A2320]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8B547] flex items-center justify-center font-black text-[#0A0F0D] text-sm">Q</div>
            <span className="font-bold tracking-tight text-[#EFE9DA]">QueueForge</span>
            <span className="hidden lg:inline text-xs px-2 py-1 rounded-full bg-[#141C18] border border-[#263329] text-[#EFE9DA]/50 ml-2">Early access • 90 days free</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-[#EFE9DA]/60 hover:text-[#EFE9DA] transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link href={getDashboardHref()}><Button variant="ghost" size="sm">{getDashboardLabel()}</Button></Link>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin"><Button variant="ghost" size="sm">Sign in</Button></Link>
                <Link href="/auth/signup"><Button variant="primary" size="sm" className="rounded-full px-5">Start free trial →</Button></Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2 text-[#EFE9DA]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        <div className={`${mobileMenuOpen ? '' : 'hidden'} md:hidden py-3 border-t border-[#1A2320]`}>
          <nav className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm text-[#EFE9DA]/70 hover:text-[#EFE9DA] hover:bg-[#141C18] rounded-lg">
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#1A2320]">
              {session ? (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</Button>
              ) : (
                <>
                  <Link href="/auth/signin" className="flex-1"><Button variant="outline" size="sm" className="w-full">Sign in</Button></Link>
                  <Link href="/auth/signup" className="flex-1"><Button variant="primary" size="sm" className="w-full rounded-full">Start free trial →</Button></Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
