import Link from 'next/link'

const footerLinks = {
  product: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Live demo', href: '/queue/join?shop=demo' },
    { label: 'Start free trial', href: '/auth/signup' },
  ],
  support: [
    { label: 'WhatsApp', href: 'https://wa.me/919876543210?text=Hi%20QueueForge%20%E2%80%94%20help%20me%20with%20my%20queue' },
    { label: 'Email', href: 'mailto:support@queueforge.in' },
    { label: 'FAQ', href: '/#faq' },
  ],
  legal: [
    { label: 'Privacy — coming soon', href: '/privacy' },
    { label: 'Terms — coming soon', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0A0F0D] border-t border-[#1A2320]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#E8B547] flex items-center justify-center font-black text-[#0A0F0D] text-sm">Q</div>
              <span className="font-bold text-[#EFE9DA]">QueueForge</span>
            </Link>
            <p className="text-sm text-[#EFE9DA]/50 leading-relaxed">
              Queue + booking for every business where people wait. QR join, live ETA, no app.
            </p>
            <p className="text-xs text-[#EFE9DA]/30 mt-3">Early access • 90 days free • No fake reviews — 0 customers yet, be first.</p>
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-widest text-[#EFE9DA]/30 uppercase mb-3">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm text-[#EFE9DA]/60 hover:text-[#EFE9DA]">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-widest text-[#EFE9DA]/30 uppercase mb-3">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}><a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener' : undefined} className="text-sm text-[#EFE9DA]/60 hover:text-[#EFE9DA]">{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-widest text-[#EFE9DA]/30 uppercase mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm text-[#EFE9DA]/40 hover:text-[#EFE9DA]/60">{link.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#1A2320] flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-xs text-[#EFE9DA]/30" suppressHydrationWarning>© {new Date().getFullYear()} QueueForge • IST • Real queue, real business hours</p>
          <p className="text-xs text-[#EFE9DA]/20">Built for India — works on 2G, no app download</p>
        </div>
      </div>
    </footer>
  )
}
