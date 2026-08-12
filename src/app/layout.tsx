import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'QueueForge — Build Your Queue, Skip the Wait',
  description:
    'The open platform for queue management, booking, and customer engagement. Free for barbershops, salons, clinics, auto shops, and any business where people wait.',
  keywords: ['queue management', 'booking', 'appointment', 'salon', 'barber', 'dental', 'clinic', 'auto repair', 'government', 'bank'],
  openGraph: {
    title: 'QueueForge — Build Your Queue, Skip the Wait',
    description:
      'The open platform for queue management, booking, and customer engagement.',
    type: 'website',
    locale: 'en_US',
    siteName: 'QueueForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QueueForge — Build Your Queue, Skip the Wait',
    description:
      'The open platform for queue management, booking, and customer engagement.',
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
        <Providers>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
