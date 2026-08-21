import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const geistSans = localFont({
  src: '../fonts/GeistSans-Variable.ttf',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: '../fonts/GeistMono-Variable.ttf',
  variable: '--font-geist-mono',
  weight: '100 900',
})

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
    <html lang="en" className={geistSans.variable}>
      <body className={`${geistSans.className} ${geistMono.className} min-h-screen bg-[#0A0F0D] text-[#EFE9DA] antialiased`}>
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
