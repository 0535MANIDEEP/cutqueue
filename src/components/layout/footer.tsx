import Link from 'next/link'

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Queue Demo', href: '/queue' },
    { label: 'API', href: '/docs/api' },
  ],
  company: [
    { label: 'About', href: '/#about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  social: [
    { label: 'Twitter', href: 'https://twitter.com/cutqueue' },
    { label: 'Instagram', href: 'https://instagram.com/cutqueue' },
    { label: 'GitHub', href: 'https://github.com/cutqueue' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0F1B17] border-t border-[#2A3F3A]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#E8B547] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#0F1B17]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#EFE9DA]">
                Cut<span className="text-[#E8B547]">Queue</span>
              </span>
            </Link>
            <p className="text-sm text-[#EFE9DA]/60 mb-4">
              The modern queue and booking platform for barbershops.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#EFE9DA] mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#EFE9DA]/60 hover:text-[#EFE9DA] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#EFE9DA] mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#EFE9DA]/60 hover:text-[#EFE9DA] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#EFE9DA] mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#EFE9DA]/60 hover:text-[#EFE9DA] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#2A3F3A]/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#EFE9DA]/40">
            © {new Date().getFullYear()} CutQueue. All rights reserved.
          </p>
          <div className="flex gap-4">
            {footerLinks.social.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#EFE9DA]/40 hover:text-[#EFE9DA] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
