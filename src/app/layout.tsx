import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'CutQueue — Skip the Line, Book the Vibe',
  description:
    'The modern queue and booking platform for barbershops. Manage queues, bookings, and your portfolio — all in one place.',
  keywords: ['barbershop', 'queue', 'booking', 'appointment', 'salon', 'barber'],
  openGraph: {
    title: 'CutQueue — Skip the Line, Book the Vibe',
    description:
      'The modern queue and booking platform for barbershops.',
    type: 'website',
    locale: 'en_US',
    siteName: 'CutQueue',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CutQueue — Skip the Line, Book the Vibe',
    description:
      'The modern queue and booking platform for barbershops.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className={`${GeistSans.className} ${GeistMono.className} min-h-screen bg-[#0A0F0D] text-[#EFE9DA] antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
