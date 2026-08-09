import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#E8B547] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0A0F0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#EFE9DA]">
              Cut<span className="text-[#E8B547]">Queue</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#EFE9DA] mb-2">Create your account</h1>
          <p className="text-[#EFE9DA]/50">Start managing your shop in minutes</p>
        </div>

        <div className="rounded-2xl bg-[#141C18] border border-[#263329] p-6">
          <form className="space-y-4">
            <Input label="Shop Name" type="text" placeholder="Sharp Edgez Barbershop" />
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input label="Password" type="password" placeholder="••••••••" />
            <Button variant="primary" className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#EFE9DA]/40">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-[#E8B547] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
