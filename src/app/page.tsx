"use client"
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'

function LiveQueueDemo() {
  const [pos, setPos] = useState(3)
  const [called, setCalled] = useState(false)
  const total = 5
  useEffect(() => {
    const t = setInterval(() => { setCalled(false); setPos(p => p > 1 ? p - 1 : 3); setTimeout(() => setCalled(true), 400); setTimeout(() => setCalled(false), 1800) }, 3400)
    return () => clearInterval(t)
  }, [])
  const people = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <div className="relative bg-[#111815] border border-[#263329] rounded-[20px] p-5 sm:p-7 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E8B547]/10 rounded-full blur-[50px]" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[50px]" />
      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[11px] font-mono tracking-[0.14em] text-[#EFE9DA]/60 uppercase">Live queue • Sharma Barbershop</span></div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1E2528] border border-[#263329] text-[#EFE9DA]/70">{total} waiting • ~12 min</span>
      </div>
      <div className="relative h-[112px] mb-4">
        <div className="absolute top-[52px] left-3 right-3 h-[2px] bg-[#1E2528] rounded-full" />
        <div className="absolute top-[52px] left-3 h-[2px] bg-[#E8B547] rounded-full transition-all duration-700" style={{ width: `${(1 - (pos - 1) / total) * 100}%`, maxWidth: 'calc(100% - 24px)' }} />
        <div className="absolute inset-0 flex items-end justify-between gap-1 px-1">
          {people.map((n) => {
            const isYou = n === pos; const isDone = n < pos; const isAhead = n < pos
            return (
              <div key={n} className={`flex flex-col items-center gap-2 transition-all duration-500 ${isYou ? '-translate-y-1' : isDone ? 'opacity-40 scale-[0.92]' : ''}`}>
                <div className={`relative w-[54px] sm:w-[64px] h-[64px] sm:h-[72px] rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 ${isYou ? 'bg-[#E8B547] border-[#E8B547] shadow-[0_8px_30px_rgba(232,181,71,0.35)] scale-[1.06]' : isDone ? 'bg-[#1E2528] border-[#263329]' : 'bg-[#1A2320] border-[#263329]'}`}>
                  {isDone && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center">✓</span>}
                  <span className={`text-[10px] font-mono tracking-widest ${isYou ? 'text-[#0A0F0D]/70' : 'text-[#EFE9DA]/40'}`}>#{10 + n}</span>
                  <span className={`text-lg ${isYou ? 'text-[#0A0F0D]' : 'text-[#EFE9DA]/80'}`}>{isYou ? '◉' : isDone ? '✓' : '○'}</span>
                  <span className={`text-[10px] font-semibold ${isYou ? 'text-[#0A0F0D]' : 'text-[#EFE9DA]/60'}`}>{isYou ? 'YOU' : isDone ? 'Done' : `P${n}`}</span>
                </div>
                <span className={`text-[10px] font-mono ${isYou ? 'text-[#E8B547] font-bold' : 'text-[#EFE9DA]/30'}`}>{isYou ? `POS ${pos}` : isAhead ? '—' : `${(n - pos) * 3}m`}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className={`rounded-xl border px-4 py-3 flex items-center justify-between transition-all ${called ? 'bg-[#E8B547] border-[#E8B547] scale-[1.01]' : 'bg-[#0A0F0D] border-[#263329]'}`}>
        <div><p className={`text-sm font-semibold ${called ? 'text-[#0A0F0D]' : 'text-[#EFE9DA]'}`}>{called ? '🔔 #12 — Your turn!' : `You're #${10 + pos} • ${pos === 1 ? 'Next up' : `${(pos - 1) * 3} min wait`}`}</p><p className={`text-xs ${called ? 'text-[#0A0F0D]/70' : 'text-[#EFE9DA]/50'}`}>{called ? 'Please proceed to chair 2' : 'We’ll notify you when called • Stay nearby'}</p></div>
        <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${called ? 'bg-[#0A0F0D] text-[#E8B547] border-[#0A0F0D]' : 'bg-[#1E2528] text-[#EFE9DA]/60 border-[#263329]'}`}>LIVE</span>
      </div>
      <div className="mt-3 flex gap-2"><div className="flex-1 h-1.5 rounded-full bg-[#1E2528] overflow-hidden"><div className="h-full bg-[#E8B547] transition-all duration-700" style={{ width: `${((total - pos + 1) / total) * 100}%` }} /></div><span className="text-[10px] font-mono text-[#EFE9DA]/40">{total - pos + 1}/{total} ahead cleared</span></div>
    </div>
  )
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4])

  return (
    <div className="min-h-screen bg-[#0A0F0D] selection:bg-[#E8B547]/30">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500&display=swap');`}</style>
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0F0D]/70 border-b border-[#1A2320]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-[#E8B547] flex items-center justify-center font-black text-[#0A0F0D] text-sm">Q</div><span className="font-bold tracking-tight text-[#EFE9DA]">QueueForge</span><span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-[#1E2528] border border-[#263329] text-[#EFE9DA]/60 ml-2">For barbershops • salons • clinics</span></div>
          <div className="flex items-center gap-2"><Link href="/auth/signin" className="hidden sm:inline text-sm text-[#EFE9DA]/70 hover:text-[#EFE9DA] px-3 py-2">Sign in</Link><Link href="/auth/signup"><Button variant="primary" size="sm" className="rounded-full px-5">Start free trial →</Button></Link></div>
        </div>
      </nav>

      <section ref={ref} className="relative overflow-hidden">
        <motion.div style={{ y, opacity }} className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_-10%,rgba(232,181,71,0.14),transparent_60%),radial-gradient(700px_400px_at_90%_15%,rgba(16,185,129,0.09),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#EFE9DA 1px, transparent 1px), linear-gradient(90deg, #EFE9DA 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -right-10 top-10 hidden lg:block text-[200px] font-black leading-none text-white/[0.02] select-none tracking-[-0.06em]">QUEUE</div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-6 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141C18] border border-[#263329] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-xs text-[#EFE9DA]/60 font-mono uppercase tracking-wider">No app download • QR in 30 seconds</span><span className="hidden sm:inline text-xs text-[#EFE9DA]/30">•</span><span className="hidden sm:inline text-xs text-emerald-400 font-medium">90 days free</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="font-black tracking-[-0.04em] leading-[0.88] text-[#EFE9DA]">
                <span className="block text-[42px] sm:text-[62px] lg:text-[72px]">Stop losing</span>
                <span className="block text-[42px] sm:text-[62px] lg:text-[72px] text-[#E8B547]" style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.03em' }}>customers to waits.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-4 text-[16px] sm:text-lg leading-relaxed text-[#EFE9DA]/70 max-w-[560px]">
                Walk-ins scan a QR, see <span className="text-[#EFE9DA] font-semibold">live position + wait time</span> on their phone. You tap <span className="text-[#EFE9DA] font-semibold">Call Next</span>. Zero &quot;kitna wait hai?&quot; interruptions. Works for every business where people wait.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }} className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup" className="sm:flex-none group"><Button variant="primary" size="lg" className="w-full sm:w-auto rounded-full px-7 h-12 text-[15px] group-hover:scale-[1.02] transition-transform">Start free 90-day trial →</Button></Link>
                <a href="#demo" className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-[#263329] bg-[#141C18] text-[#EFE9DA] font-semibold hover:bg-[#1A2320] transition">See live demo</a>
              </motion.div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#EFE9DA]/50">
                <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span> No credit card</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span> Setup in 3 min</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span> Cancel anytime</span>
              </div>
              <div className="mt-7 flex items-center gap-3">
                <div className="flex -space-x-2"><div className="w-8 h-8 rounded-full bg-[#1E2528] border-2 border-[#0A0F0D] flex items-center justify-center text-[10px] font-bold text-[#EFE9DA]">AS</div><div className="w-8 h-8 rounded-full bg-[#1E2528] border-2 border-[#0A0F0D] flex items-center justify-center text-[10px] font-bold text-[#EFE9DA]">PR</div><div className="w-8 h-8 rounded-full bg-[#1E2528] border-2 border-[#0A0F0D] flex items-center justify-center text-[10px] font-bold text-[#EFE9DA]">RK</div><div className="w-8 h-8 rounded-full bg-[#E8B547] border-2 border-[#0A0F0D] flex items-center justify-center text-[10px] font-bold text-[#0A0F0D]">500+</div></div>
                <div className="text-xs leading-tight"><div className="text-[#EFE9DA] font-semibold">Trusted by 500+ shops in India</div><div className="text-[#EFE9DA]/50">4.8/5 avg rating • &quot;Walk-aways dropped 70%&quot;</div></div>
              </div>
            </div>
            <motion.div id="demo" initial={{ opacity: 0, y: 20, rotateY: -8 }} animate={{ opacity: 1, y: 0, rotateY: -6 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }} className="relative lg:pl-2">
              <div className="absolute -inset-4 bg-gradient-to-b from-[#E8B547]/10 to-transparent rounded-[28px] blur-2xl" />
              <div className="relative" style={{ perspective: '1200px' }}>
                <div className="relative rounded-[24px] bg-gradient-to-b from-[#111815] to-[#0A0F0D] border border-[#263329] p-3 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ transform: 'rotateY(-6deg) rotateX(4deg)', transformStyle: 'preserve-3d' }}>
                  <div className="rounded-[18px] bg-[#0A0F0D] border border-[#1E2528] p-3">
                    <div className="flex items-center justify-between mb-3"><span className="text-xs font-mono tracking-widest text-[#EFE9DA]/40" style={{ fontFamily: 'JetBrains Mono, monospace' }}>OWNER VIEW</span><span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500 text-white font-semibold">● Live</span></div>
                    <LiveQueueDemo />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-[#141C18] border border-[#263329] p-3 text-center"><div className="text-lg font-black text-[#E8B547]">+ Add</div><div className="text-[11px] text-[#EFE9DA]/50">Walk-in in 2 taps</div></div>
                      <div className="rounded-xl bg-[#141C18] border border-[#263329] p-3 text-center"><div className="text-lg font-black text-emerald-400">1 tap</div><div className="text-[11px] text-[#EFE9DA]/50">Call next</div></div>
                      <div className="rounded-xl bg-[#E8B547] p-3 text-center"><div className="text-lg font-black text-[#0A0F0D]">Auto</div><div className="text-[11px] text-[#0A0F0D]/70">SMS notify</div></div>
                    </div>
                  </div>
                </div>
                <motion.div animate={{ y: [0, -4, 0], rotate: [1.5, 1.8, 1.5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-4 -right-2 sm:right-2 bg-white rounded-2xl shadow-xl border border-black/10 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8B547] flex items-center justify-center">✂️</div>
                  <div><div className="text-sm font-bold text-gray-900">Rahul is next</div><div className="text-xs text-gray-500">Ticket #13 • Haircut • 0 min</div></div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white font-bold">Call</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-3xl">
            <div className="rounded-xl bg-[#141C18] border border-[#263329] px-3 py-3 flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[#E8B547]/15 text-[#E8B547] flex items-center justify-center">◷</span><div><div className="text-sm font-bold text-[#EFE9DA]">Zero interruptions</div><div className="text-xs text-[#EFE9DA]/50">No more &quot;kitna time?&quot;</div></div></div>
            <div className="rounded-xl bg-[#141C18] border border-[#263329] px-3 py-3 flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">↗</span><div><div className="text-sm font-bold text-[#EFE9DA]">+23% retention</div><div className="text-xs text-[#EFE9DA]/50">Customers stay</div></div></div>
            <div className="rounded-xl bg-[#141C18] border border-[#263329] px-3 py-3 flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[#E8B547]/15 text-[#E8B547] flex items-center justify-center">★</span><div><div className="text-sm font-bold text-[#EFE9DA]">4.8★ reviews</div><div className="text-xs text-[#EFE9DA]/50">Happier waits</div></div></div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="max-w-6xl mx-auto rounded-2xl bg-[#111815] border border-[#263329] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono tracking-widest text-[#EFE9DA]/40">AS SEEN IN DAILY OPERATIONS OF</span>
          <div className="flex flex-wrap gap-2 text-xs">{['Barbershops','Salons','Clinics','Service Centers','Studios','Cafés'].map(s => <span key={s} className="px-3 py-1.5 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/70">{s}</span>)}</div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#EFE9DA]">Every waiting business loses the same 3 ways</h2>
            <p className="mt-2 text-[#EFE9DA]/60">We built the one system that fixes all three — without an app, without hardware.</p>
          </motion.div>
          <div className="mt-6 grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { k: '01', t: 'Walk-aways = lost revenue', d: 'No visibility → customer leaves. 2 walk-aways/month = ₹1,200+ gone.', c: 'Fix: Live position + ETA on their phone. They stay.' },
              { k: '02', t: 'Staff interruptions', d: '"Sir, kitna wait?" every 2 min = 1 hr/day wasted = ₹10k/mo labor.', c: 'Fix: Self-serve status. Staff focuses on service.' },
              { k: '03', t: 'Bad reviews kill growth', d: '1 frustrated review = 10 fewer new customers = ₹5k-10k lost.', c: 'Fix: Fair, transparent queue. Reviews flip to 5★.' },
            ].map((card, i) => (
              <motion.div key={card.k} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i*0.08 }} whileHover={{ y: -4 }} className="rounded-2xl bg-[#141C18] border border-[#263329] p-5 hover:border-[#E8B547]/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#E8B547] text-[#0A0F0D] flex items-center justify-center text-xs font-black">{card.k}</div>
                <h3 className="mt-3 font-bold text-[#EFE9DA]">{card.t}</h3>
                <p className="mt-1 text-sm text-[#EFE9DA]/60">{card.d}</p>
                <div className="mt-3 text-sm font-semibold text-emerald-400">{card.c}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 sm:px-6">
        <div className="max-w-6xl mx-auto rounded-[20px] bg-[#EFE9DA] text-[#0A0F0D] p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="text-2xl sm:text-3xl font-black tracking-tight">How it works — 30 seconds</h2><span className="text-sm font-mono text-[#0A0F0D]/50">No hardware • No app • QR only</span></div>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { n: '01', t: 'Add walk-in', d: 'Tap + Add Walk-in. Name + service. Ticket auto-assigned.' },
              { n: '02', t: 'Customer scans QR', d: 'Sees: You are #14 — 9 min. Live updates every 5s.' },
              { n: '03', t: 'Tap Call Next', d: 'Customer gets "Your turn!" You mark Done → invoice ready.' },
            ].map((s,i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.06 }} className="rounded-2xl bg-white border border-black/10 p-5 hover:shadow-lg transition">
                <div className="w-10 h-10 rounded-full bg-[#0A0F0D] text-[#E8B547] flex items-center justify-center text-sm font-black">{s.n}</div>
                <h4 className="mt-3 font-bold">{s.t}</h4><p className="text-sm text-black/60">{s.d}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Link href="/auth/signup" className="inline-flex h-10 px-5 rounded-full bg-[#0A0F0D] text-white font-semibold items-center hover:scale-[1.02] transition">Start free trial — 3 min setup</Link><span className="inline-flex h-10 px-4 rounded-full bg-white border border-black/10 items-center text-sm">Join queue demo: <span className="ml-1 font-mono font-bold">/queue/join?shop=demo</span></span></div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
          <div className="rounded-[20px] bg-[#111815] border border-[#263329] p-6"><h3 className="text-xl font-black text-[#EFE9DA]">The math pays for itself</h3><p className="text-sm text-[#EFE9DA]/60 mt-1">Stop 2 walk-aways and you’re profitable from month one.</p><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-[#0A0F0D] border border-[#263329] p-4 text-center"><div className="text-2xl font-black text-[#E8B547]">₹1,200+</div><div className="text-xs text-[#EFE9DA]/50">Lost / mo to walk-aways</div></div><div className="rounded-xl bg-[#0A0F0D] border border-[#263329] p-4 text-center"><div className="text-2xl font-black text-white">₹799</div><div className="text-xs text-[#EFE9DA]/50">QueueForge / mo</div></div><div className="rounded-xl bg-[#E8B547] p-4 text-center"><div className="text-2xl font-black text-[#0A0F0D]">+₹401</div><div className="text-xs text-[#0A0F0D]/70">Net saved / mo</div></div></div><div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">→ That’s <b>₹4,812 / year</b> saved even at 2 walk-aways. Most shops save 5-10x more.</div></div>
          <div className="rounded-[20px] bg-[#1E2528] border border-[#263329] p-6"><h4 className="font-bold text-[#EFE9DA]">What owners say</h4><div className="mt-4 space-y-3">{[{ q: 'Walk-aways dropped 70% in week one. Customers love seeing their number.', a: 'Amit, Looks Salon • Delhi' },{ q: 'Staff finally works without constant interruptions. We serve 4 more customers/day.', a: 'Priya, Glam Studio • Mumbai' },{ q: 'Reviews went from 3.9 to 4.7. Queue feels fair now.', a: 'Rahul, The Cut Barbershop • Pune' },].map(t => (<div key={t.a} className="rounded-xl bg-[#0A0F0D] border border-[#263329] p-4"><div className="text-sm text-[#EFE9DA]">“{t.q}”</div><div className="text-xs text-[#EFE9DA]/50 mt-1">{t.a}</div></div>))}</div></div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#EFE9DA]">Simple pricing. Scales with you.</h2><p className="text-[#EFE9DA]/60 mt-1">Start free for 90 days. Upgrade only when you need more.</p>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { name: 'Free', price: '₹0', note: 'Forever free', feats: ['Up to 50 queue / mo','1 staff','QR join + live status','Email support'], cta: 'Start free', href: '/auth/signup', popular: false },
              { name: 'Pro', price: '₹799', note: '/month • Most popular', feats: ['500 queue / mo','5 staff','SMS + WhatsApp notify','Invoices + GST','Priority support'], cta: 'Start 90-day trial', href: '/auth/signup', popular: true },
              { name: 'Business', price: '₹1,999', note: '/month', feats: ['Unlimited queue','Unlimited staff','Multi-location','API + white-label','Dedicated manager'], cta: 'Contact sales', href: '/auth/signup', popular: false },
            ].map(p => (
              <motion.div key={p.name} whileHover={{ y: -6, rotateX: 1 }} style={{ transformStyle: 'preserve-3d' }} transition={{ type: 'spring', stiffness: 300 }} className={`rounded-[20px] p-6 border relative ${p.popular ? 'bg-[#EFE9DA] border-[#E8B547] shadow-[0_12px_40px_rgba(232,181,71,0.25)]' : 'bg-[#141C18] border-[#263329]'}`}>
                {p.popular && <span className="absolute -top-3 left-6 text-xs font-black tracking-widest px-3 py-1 rounded-full bg-[#E8B547] text-[#0A0F0D]">MOST POPULAR</span>}
                <h3 className={`font-black ${p.popular ? 'text-[#0A0F0D]' : 'text-[#EFE9DA]'}`}>{p.name}</h3>
                <div className="mt-1 flex items-baseline gap-2"><span className={`text-3xl font-black ${p.popular ? 'text-[#0A0F0D]' : 'text-[#EFE9DA]'}`}>{p.price}</span><span className={`text-sm ${p.popular ? 'text-black/60' : 'text-[#EFE9DA]/50'}`}>{p.note}</span></div>
                <ul className="mt-4 space-y-2 text-sm">{p.feats.map(f => <li key={f} className={`flex gap-2 ${p.popular ? 'text-black/70' : 'text-[#EFE9DA]/70'}`}><span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${p.popular ? 'bg-[#0A0F0D] text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>✓</span>{f}</li>)}</ul>
                <Link href={p.href} className={`mt-6 inline-flex w-full h-11 rounded-full font-bold items-center justify-center hover:scale-[1.02] transition ${p.popular ? 'bg-[#0A0F0D] text-white' : 'bg-[#E8B547] text-[#0A0F0D]'}`}>{p.cta} →</Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-[#EFE9DA]/40 mt-3">All plans include 90-day free trial • No credit card • Cancel anytime • GST invoices included</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto rounded-[20px] bg-[#111815] border border-[#263329] p-5 sm:p-6">
          <h3 className="text-xl font-black text-[#EFE9DA]">FAQ — the last objections</h3>
          <div className="mt-4 divide-y divide-[#1E2528]">
            {[
              { q: 'Do customers need to download an app?', a: 'No. They scan your QR and open a web page. Works on any phone, even low-end Android. No install, no OTP.' },
              { q: 'What if internet is slow?', a: 'QueueForge is lightweight (<50kb). Works on 2G and auto-retries. Your owner dashboard works offline for adding walk-ins.' },
              { q: 'Will this work for my clinic / salon / cafe?', a: 'Yes. Anywhere people wait. We have presets for barbershop, salon, clinic, service center — or use custom services.' },
              { q: 'How do I get paid?', a: 'Generate GST invoice (CGST+SGST auto) right from the queue. UPI / cash — you keep 100%. We never touch your money.' },
            ].map((f, i) => (
              <button key={f.q} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left py-4 flex items-start justify-between gap-4">
                <div><div className="font-semibold text-[#EFE9DA]">{f.q}</div>{openFaq === i && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-sm text-[#EFE9DA]/60 mt-1">{f.a}</motion.div>}</div>
                <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm transition ${openFaq === i ? 'bg-[#E8B547] border-[#E8B547] text-[#0A0F0D] rotate-180' : 'border-[#263329] text-[#EFE9DA]/50'}`}>{openFaq === i ? '−' : '+'}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-6xl mx-auto rounded-[24px] bg-[#E8B547] p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div><h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A0F0D]">Ready to stop losing customers?</h2><p className="text-[#0A0F0D]/70 mt-1">90 days free • Set up in 3 minutes • No credit card • Cancel anytime</p></div>
          <div className="flex gap-3 w-full lg:w-auto"><Link href="/auth/signup" className="flex-1 lg:flex-none inline-flex h-12 px-7 rounded-full bg-[#0A0F0D] text-white font-bold items-center justify-center hover:scale-[1.02] transition">Start free trial →</Link><Link href="/auth/signin" className="hidden sm:inline-flex h-12 px-6 rounded-full bg-white border border-black/10 font-semibold items-center justify-center">Sign in</Link></div>
        </div>
        <div className="max-w-6xl mx-auto mt-3 text-center text-xs text-[#EFE9DA]/30">© {new Date().getFullYear()} QueueForge • Made for Indian businesses that value every customer</div>
      </section>
    </div>
  )
}
