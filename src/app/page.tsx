import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeIn, StaggerChildren, StaggerItem, ScaleIn } from '@/components/motion'
import { QueueDemo } from '@/components/sections/queue-demo'
import { Testimonials } from '@/components/sections/testimonials'

const features = [
  {
    title: 'Virtual Queue',
    description: 'Customers join remotely. Get notified when it\'s their turn. No more crowded waiting areas.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    span: 'col-span-1 md:col-span-2',
    accent: true,
  },
  {
    title: 'Online Booking',
    description: '24/7 appointments. Syncs with your calendar.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    span: 'col-span-1',
    accent: false,
  },
  {
    title: 'Portfolio',
    description: 'Showcase your best work. Let customers find their style.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    span: 'col-span-1',
    accent: false,
  },
  {
    title: 'Loyalty & Points',
    description: 'Reward returning customers. Points, tiers, exclusive perks.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    span: 'col-span-1',
    accent: false,
  },
  {
    title: 'Analytics',
    description: 'Track bookings, revenue, customer insights. Make data-driven decisions.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    span: 'col-span-1 md:col-span-2',
    accent: false,
  },
]

const logos = [
  'Sharp Edgez', 'The Blend', 'Crown Cuts', 'Fresh Fades', 'Style House', 'The Chop Shop'
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      {/* ─── HERO ─── Split-screen: copy left, image right */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141C18] border border-[#263329] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#EFE9DA]/60 font-mono uppercase tracking-wider">Live in 50+ cities</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EFE9DA] mb-6 leading-[1.05] tracking-tight">
                Your chair is
                <br />
                <span className="text-[#E8B547]">waiting.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg text-[#EFE9DA]/50 max-w-md mb-8 leading-relaxed">
                Queue management, booking, and portfolio — built for barbers who work from their phone.
                Zero setup cost. Start in minutes.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Free
                  </Button>
                </Link>
                <Link href="/queue">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See Live Demo
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Hero Visual — Real barbershop imagery */}
          <FadeIn delay={0.2} className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="https://picsum.photos/seed/barbershop-chair/800/1000"
                alt="Modern barbershop interior"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0D]/80 via-transparent to-transparent" />

              {/* Floating queue card */}
              <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#EFE9DA]/50 font-mono uppercase tracking-wider">Next up</p>
                    <p className="text-sm font-semibold text-[#EFE9DA] mt-0.5">Marcus J. — Fade + Lineup</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E8B547] flex items-center justify-center text-[#0A0F0D] font-bold text-sm">
                    #3
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── LOGO WALL ─── Under hero, per Taste §4.8 */}
      <section className="py-12 border-t border-[#263329]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-xs text-[#EFE9DA]/30 font-mono uppercase tracking-widest text-center mb-8">
              Trusted by barbershops across the country
            </p>
          </FadeIn>
          <StaggerChildren className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {logos.map((logo) => (
              <StaggerItem key={logo}>
                <span className="text-[#EFE9DA]/20 text-sm font-medium tracking-wide hover:text-[#EFE9DA]/40 transition-colors duration-300">
                  {logo}
                </span>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── FEATURES ─── Bento grid, varied cell sizes */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
              Built for the chair
            </h2>
            <p className="text-[#EFE9DA]/40 max-w-lg mx-auto">
              Everything you need to run your shop. Nothing you don&apos;t.
            </p>
          </FadeIn>

          <div className="bento-grid">
            {features.map((feature, i) => (
              <ScaleIn
                key={feature.title}
                delay={i * 0.06}
                className={`${feature.span} group relative rounded-2xl bg-[#141C18] border border-[#263329] p-6 lg:p-8 hover:border-[#E8B547]/30 transition-colors duration-300`}
              >
                {feature.accent && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8B547]/5 rounded-full blur-2xl" />
                )}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#E8B547]/10 flex items-center justify-center text-[#E8B547] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#EFE9DA] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#EFE9DA]/40 leading-relaxed">{feature.description}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUEUE DEMO ─── Interactive section */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#141C18]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
              See it in action
            </h2>
            <p className="text-[#EFE9DA]/40 max-w-lg mx-auto">
              Real-time queue updates. Your customers see their position. You manage everything from your phone.
            </p>
          </FadeIn>
          <ScaleIn>
            <QueueDemo />
          </ScaleIn>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── Social proof */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
              What barbers say
            </h2>
          </FadeIn>
          <Testimonials />
        </div>
      </section>

      {/* ─── PRICING ─── Asymmetric layout, not identical cards */}
      <section id="pricing" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#141C18]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
              Simple pricing
            </h2>
            <p className="text-[#EFE9DA]/40 max-w-lg mx-auto">
              Start free. Upgrade when you&apos;re ready. No hidden fees.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Free — smaller card */}
            <ScaleIn delay={0}>
              <div className="rounded-2xl bg-[#0A0F0D] border border-[#263329] p-6">
                <p className="text-xs font-mono text-[#EFE9DA]/40 uppercase tracking-wider mb-2">Starter</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-[#EFE9DA]">$0</span>
                  <span className="text-sm text-[#EFE9DA]/40">/mo</span>
                </div>
                <p className="text-sm text-[#EFE9DA]/50 mb-6">For barbers just getting started.</p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full" size="md">
                    Start Free
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3 text-sm text-[#EFE9DA]/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Virtual queue
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Basic booking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    1 barber
                  </li>
                </ul>
              </div>
            </ScaleIn>

            {/* Pro — featured, larger card */}
            <ScaleIn delay={0.1}>
              <div className="rounded-2xl bg-[#0A0F0D] border-2 border-[#E8B547] p-6 lg:p-8 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[#E8B547] text-[#0A0F0D] text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
                <p className="text-xs font-mono text-[#E8B547] uppercase tracking-wider mb-2">Pro</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-[#EFE9DA]">$25</span>
                  <span className="text-sm text-[#EFE9DA]/40">/mo</span>
                </div>
                <p className="text-sm text-[#EFE9DA]/50 mb-6">For growing barbershops.</p>
                <Link href="/auth/signup">
                  <Button variant="primary" className="w-full" size="lg">
                    Get Started
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3 text-sm text-[#EFE9DA]/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Everything in Starter
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Portfolio gallery
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Analytics dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Loyalty & points
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Up to 5 barbers
                  </li>
                </ul>
              </div>
            </ScaleIn>

            {/* Business — right side, compact */}
            <ScaleIn delay={0.2}>
              <div className="rounded-2xl bg-[#0A0F0D] border border-[#263329] p-6">
                <p className="text-xs font-mono text-[#EFE9DA]/40 uppercase tracking-wider mb-2">Business</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-[#EFE9DA]">$100</span>
                  <span className="text-sm text-[#EFE9DA]/40">/mo</span>
                </div>
                <p className="text-sm text-[#EFE9DA]/50 mb-6">For chains and enterprises.</p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full" size="md">
                    Contact Sales
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3 text-sm text-[#EFE9DA]/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Unlimited barbers
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Multi-location
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    White-label branding
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    API access
                  </li>
                </ul>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── Final push */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#263329]/50">
        <FadeIn className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-6 tracking-tight">
            Ready to stop losing customers to wait times?
          </h2>
          <p className="text-[#EFE9DA]/40 mb-8 max-w-md mx-auto">
            Free to start. No credit card. Set up your shop in under 5 minutes.
          </p>
          <Link href="/auth/signup">
            <Button variant="primary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </FadeIn>
      </section>
    </div>
  )
}
