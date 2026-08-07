import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Virtual Queue',
    description: 'No more waiting in line. Customers join remotely and get notified when it\'s their turn.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Online Booking',
    description: 'Let customers book appointments 24/7. Syncs with your calendar automatically.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Portfolio Showcase',
    description: 'Barbers showcase their best work. Customers find the perfect style.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Loyalty Rewards',
    description: 'Points, tiers, and exclusive perks. Keep customers coming back.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Multi-Location',
    description: 'Manage multiple shops from one dashboard. Perfect for growing chains.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analytics',
    description: 'Track bookings, revenue, and customer insights. Make data-driven decisions.',
  },
]

const stats = [
  { value: '10K+', label: 'Barbershops' },
  { value: '500K+', label: 'Customers Served' },
  { value: '4.9', label: 'App Rating' },
  { value: '99.9%', label: 'Uptime' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F1B17]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B17] via-[#1E2E29] to-[#0F1B17]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E8B547]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E8B547]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E2E29] border border-[#2A3F3A] mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-[#EFE9DA]/70">Now live in 50+ cities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#EFE9DA] mb-6 leading-tight">
            Skip the Line.
            <br />
            <span className="text-[#E8B547]">Book the Vibe.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#EFE9DA]/60 max-w-2xl mx-auto mb-10">
            The modern platform for barbershops. Manage queues, bookings, and your 
            portfolio — all in one place. Zero friction for you and your customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Start Free — No Credit Card
              </Button>
            </Link>
            <Link href="/queue">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See Live Queue Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-[#E8B547]">{stat.value}</div>
                <div className="text-sm text-[#EFE9DA]/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-[#EFE9DA]/60 max-w-2xl mx-auto">
              Built for barbers, loved by customers. One platform to run your entire shop.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} hover>
                <CardContent>
                  <div className="w-12 h-12 rounded-lg bg-[#E8B547]/10 flex items-center justify-center text-[#E8B547] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#EFE9DA] mb-2">{feature.title}</h3>
                  <p className="text-[#EFE9DA]/60">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#1E2E29] to-[#0F1B17]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-6">
            Ready to Transform Your Shop?
          </h2>
          <p className="text-lg text-[#EFE9DA]/60 mb-8">
            Join thousands of barbers who are already using CutQueue to grow their business.
          </p>
          <Link href="/auth/signup">
            <Button variant="primary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
