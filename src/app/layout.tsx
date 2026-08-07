import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
})

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
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-[#0F1B17] text-[#EFE9DA] font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
