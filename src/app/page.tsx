import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeIn, StaggerChildren, StaggerItem, ScaleIn } from '@/components/motion'

const industries = [
  { name: 'Barbershops', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 01-5.196 3 3 3 0 015.196-3m1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215m-7.613 2.621a4.5 4.5 0 00-2.48-.044l-.803.215" /></svg> },
  { name: 'Hair Salons', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
  { name: 'Nail Studios', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg> },
  { name: 'Tattoo Studios', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg> },
  { name: 'Dental Clinics', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg> },
  { name: 'Medical Clinics', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { name: 'Auto Repair', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.384a1.5 1.5 0 01-2.122-2.122l5.385-5.384m0 0L6.66 7.724a1.5 1.5 0 012.122-2.122l5.384 5.384m-3.748-2.068l3.748 3.748m0 0l1.592 1.592a1.5 1.5 0 01-2.122 2.122l-1.591-1.592m-1.627.353l1.627 1.627a1.5 1.5 0 01-2.122 2.122l-1.626-1.627" /></svg> },
  { name: 'Fitness Centers', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
  { name: 'Government', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg> },
  { name: 'Banks', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg> },
  { name: 'Vet Clinics', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.228.22.444.41.613.264.232.575.41.913.526.277.091.564.141.855.147M12 3v3.75" /></svg> },
  { name: 'Photography', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg> },
]

const features = [
  {
    title: 'Live Queue',
    description: 'Customers see their position in real-time. No more crowded waiting areas.',
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
    description: '24/7 appointments. Syncs with your calendar. Customers book from their phone.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    span: 'col-span-1',
    accent: false,
  },
  {
    title: 'SMS Notifications',
    description: 'Send queue updates and booking confirmations via SMS.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    span: 'col-span-1',
    accent: false,
  },
  {
    title: 'Analytics',
    description: 'Track bookings, revenue, customer insights. Data-driven decisions.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    span: 'col-span-1 md:col-span-2',
    accent: false,
  },
]

const steps = [
  {
    step: '01',
    title: 'Create your shop',
    description: 'Add your services, set prices, upload photos. Takes 5 minutes.',
  },
  {
    step: '02',
    title: 'Share your link',
    description: 'Customers scan a QR code or visit your link to join queue or book.',
  },
  {
    step: '03',
    title: 'Manage from phone',
    description: 'See live queue, call next customer, track bookings. All from your phone.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141C18] border border-[#263329] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#EFE9DA]/60 font-mono uppercase tracking-wider">Queue management platform</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EFE9DA] mb-6 leading-[1.05] tracking-tight">
                Stop losing customers
                <br />
                <span className="text-[#E8B547]">to long waits.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg text-[#EFE9DA]/70 max-w-md mb-8 leading-relaxed">
                Queue management, online booking, and customer engagement — for any business where people wait. Barbershops, salons, clinics, and more.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Hero Visual — Industry Grid */}
          <FadeIn delay={0.2} className="relative">
            <div className="grid grid-cols-4 gap-3">
              {industries.slice(0, 8).map((industry) => (
                <div
                  key={industry.name}
                  className="aspect-square rounded-xl bg-[#141C18] border border-[#263329] flex flex-col items-center justify-center gap-2 hover:border-[#E8B547]/30 transition-colors"
                >
              <span className="text-[#E8B547]">{industry.icon}</span>
                  <span className="text-xs text-[#EFE9DA]/70 text-center leading-tight">{industry.name}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── INDUSTRY WALL ─── */}
      <section className="py-12 border-t border-[#263329]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-xs text-[#EFE9DA]/50 font-mono uppercase tracking-widest text-center mb-8">
              Built for 12+ industries
            </p>
          </FadeIn>
          <StaggerChildren className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {industries.map((industry) => (
              <StaggerItem key={industry.name}>
                <span className="text-[#EFE9DA]/40 text-sm font-medium tracking-wide hover:text-[#EFE9DA]/60 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-[#E8B547]">{industry.icon}</span> {industry.name}
                </span>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
              How it works
            </h2>
            <p className="text-[#EFE9DA]/60 max-w-lg mx-auto">
              Three steps to start managing your queue. No training needed.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <ScaleIn key={s.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#E8B547]/10 flex items-center justify-center text-[#E8B547] text-sm font-bold mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#EFE9DA] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#EFE9DA]/60">{s.description}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── Bento grid */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#141C18]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
              Everything you need
            </h2>
            <p className="text-[#EFE9DA]/60 max-w-lg mx-auto">
              Queue management, bookings, customer engagement, analytics. All in one place.
            </p>
          </FadeIn>

          <div className="bento-grid">
            {features.map((feature, i) => (
              <ScaleIn
                key={feature.title}
                delay={i * 0.06}
                className={`${feature.span} group relative rounded-2xl bg-[#0A0F0D] border border-[#263329] p-6 lg:p-8 hover:border-[#E8B547]/30 transition-colors duration-300`}
              >
                {feature.accent && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8B547]/5 rounded-full blur-2xl" />
                )}
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#E8B547]/10 flex items-center justify-center text-[#E8B547] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#EFE9DA] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#EFE9DA]/60 leading-relaxed">{feature.description}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
              Simple pricing
            </h2>
            <p className="text-[#EFE9DA]/60 max-w-lg mx-auto">
              Start free for 90 days. Upgrade when you&apos;re ready. No hidden fees.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <ScaleIn delay={0}>
              <div className="rounded-2xl bg-[#141C18] border border-[#263329] p-6">
                <p className="text-xs font-mono text-[#EFE9DA]/40 uppercase tracking-wider mb-2">Starter</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-[#EFE9DA]">₹499</span>
                  <span className="text-sm text-[#EFE9DA]/40">/mo</span>
                </div>
                <p className="text-sm text-[#EFE9DA]/50 mb-6">For small shops getting started.</p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full" size="md">Start Free Trial</Button>
                </Link>
                <ul className="mt-6 space-y-3 text-sm text-[#EFE9DA]/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Live queue
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Basic booking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Up to 10 staff
                  </li>
                </ul>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.1}>
              <div className="rounded-2xl bg-[#141C18] border-2 border-[#E8B547] p-6 lg:p-8 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[#E8B547] text-[#0A0F0D] text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
                <p className="text-xs font-mono text-[#E8B547] uppercase tracking-wider mb-2">Professional</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-[#EFE9DA]">₹999</span>
                  <span className="text-sm text-[#EFE9DA]/40">/mo</span>
                </div>
                <p className="text-sm text-[#EFE9DA]/50 mb-6">For growing businesses.</p>
                <Link href="/auth/signup">
                  <Button variant="primary" className="w-full" size="lg">Start Free Trial</Button>
                </Link>
                <ul className="mt-6 space-y-3 text-sm text-[#EFE9DA]/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Everything in Starter
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Analytics dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Automated booking reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Up to 25 staff
                  </li>
                </ul>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.2}>
              <div className="rounded-2xl bg-[#141C18] border border-[#263329] p-6">
                <p className="text-xs font-mono text-[#EFE9DA]/40 uppercase tracking-wider mb-2">Business</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-[#EFE9DA]">₹1,999</span>
                  <span className="text-sm text-[#EFE9DA]/40">/mo</span>
                </div>
                <p className="text-sm text-[#EFE9DA]/50 mb-6">For larger operations.</p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full" size="md">Start Free Trial</Button>
                </Link>
                <ul className="mt-6 space-y-3 text-sm text-[#EFE9DA]/60">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Everything in Professional
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Unlimited staff
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    No-show tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Review collection
                  </li>
                </ul>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#263329]/50">
        <FadeIn className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-6 tracking-tight">
            Ready to start?
          </h2>
          <p className="text-[#EFE9DA]/60 mb-8 max-w-md mx-auto">
            Free 90-day trial. No credit card required. Set up in under 5 minutes.
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
