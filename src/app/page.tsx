import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141C18] border border-[#263329] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#EFE9DA]/60 font-mono uppercase tracking-wider">Queue management platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EFE9DA] mb-6 leading-[1.05] tracking-tight">
            Stop losing customers
            <br />
            <span className="text-[#E8B547]">to long waits.</span>
          </h1>

          <p className="text-lg text-[#EFE9DA]/70 max-w-md mb-8 leading-relaxed">
            The only queue management system you need for any business where people wait. 
            Walk-ins check in via QR code. They see their position and estimated wait time 
            on their phone. You call the next customer with one tap. No app download required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
        </div>
      </section>

      {/* ─── WHY YOU NEED THIS ─── */}
      <section id="why-you-need-this" className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
            Why your business needs this
          </h2>
          <p className="text-[#EFE9DA]/60 mb-8">
            Every business with waiting customers has these problems. We built the system that solves all of them.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-[#1E2528] border border-[#263329] rounded-xl p-5">
            <div className="w-6 h-6 bg-[#E8B547]/20 rounded-full flex items-center justify-center text-[#E8B547] text-sm mb-3">
              ⚠
            </div>
            <h4 className="font-semibold text-[#EFE9DA] mb-1">You lose walk-in customers</h4>
            <p className="text-sm text-[#EFE9DA]/50">
              Walk-ins leave if wait is long with no visibility. Every walk-away is lost revenue you can't get back.
            </p>
          </div>

          <div className="bg-[#1E2528] border border-[#263329] rounded-xl p-4">
            <div className="w-6 h-6 bg-[#E8B547]/20 rounded-full flex items-center justify-center text-[#E8B547] text-sm mb-3">
              💼
            </div>
            <h4 className="font-semibold text-[#EFE9DA] mb-1">Your staff gets interrupted</h4>
            <p className="text-sm text-[#EFE9DA]/50">
              "Sir, kitna wait hai?" asked every 2 minutes. That's 1 hour/day of lost productivity = ₹10,000+/month in wasted labor costs.
            </p>
          </div>

          <div className="bg-[#1E2528] border border-[#263329] rounded-xl p-4">
            <div className="w-6 h-6 bg-[#E8B547]/20 rounded-full flex items-center justify-center text-[#E8B547] text-sm mb-3">
              ⭐
            </div>
            <h4 className="font-semibold text-[#EFE9DA] mb-1">You get bad Google reviews</h4>
            <p className="text-sm text-[#EFE9DA]/50">
              Frustrated waiting customers = 1 negative review = 10 fewer new customers/month = ₹5,000-₹10,000 in lost business.
            </p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
            How it works
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#141C18] border border-[#263329] rounded-xl p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E8B547]/10 flex items-center justify-center text-[#E8B547] text-sm font-bold mx-auto mb-3">01</div>
              <h4 className="font-semibold text-[#EFE9DA] mb-1">Add Walk-in</h4>
              <p className="text-xs text-[#EFE9DA]/50">Tap + Add Walk-in on your phone</p>
            </div>
            <div className="bg-[#141C18] border border-[#263329] rounded-xl p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E8B547]/10 flex items-center justify-center text-[#E8B547] text-sm font-bold mx-auto mb-3">02</div>
              <h4 className="font-semibold text-[#EFE9DA] mb-1">Customer Checks</h4>
              <p className="text-xs text-[#EFE9DA]/50">QR code → sees position + wait</p>
            </div>
            <div className="bg-[#141C18] border border-[#263329] rounded-xl p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E8B547]/10 flex items-center justify-center text-[#E8B547] text-sm font-bold mx-auto mb-3">03</div>
              <h4 className="font-semibold text-[#EFE9DA] mb-1">Call Next</h4>
              <p className="text-xs text-[#EFE9DA]/50">Tap → Customer: "Your turn!"</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE MATH ─── */}
      <section id="the-math" className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#141C18]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
            The monthly math
          </h2>
          <p className="text-[#EFE9DA]/60 mb-8">
            Even stopping just 2 walk-aways/month covers the cost. Here's what it really costs you:
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-[#1E2528] border border-[#263329] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#E8B547] mb-2">1,200+</p>
              <p className="text-sm text-[#EFE9DA]/50">Lost per month from walk-aways</p>
            </div>
            <div className="bg-[#1E2528] border border-[#263329] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#E8B547] mb-2">799</p>
              <p className="text-sm text-[#EFE9DA]/50">QueueForge subscription</p>
            </div>
            <div className="bg-[#1E2528] border border-[#263329] rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-emerald-500 mb-2">+401+</p>
              <p className="text-xs text-[#EFE9DA]/50">Net monthly savings</p>
            </div>
          </div>
          <p className="text-center text-[#EFE9DA]/60 mt-4">
            Stop losing customers. Start saving money.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-t border-[#263329]/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#EFE9DA] mb-4 tracking-tight">
            Ready to stop losing customers?
          </h2>
          <p className="text-[#EFE9DA]/60 mb-6 max-w-md">
            Free 90-day trial. No credit card required. Set up in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}