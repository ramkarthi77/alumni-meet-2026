'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function OrganizerLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)

    const res = await signIn('credentials', {
      email, password, redirect: false,
    })

    setLoading(false)
    if (res?.error) {
      setError(res.error === 'CredentialsSignin'
        ? 'Invalid email or password.'
        : res.error
      )
    } else {
      router.push('/organizer/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d3321] via-[#155e36] to-[#0d3321] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm">
        <div className="bg-gradient-to-r from-[#155e36] to-[#1a7a44] px-8 py-8 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c9a84c]/40">
            <svg className="w-7 h-7 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Organizer Login</h1>
          <p className="text-white/70 text-xs mt-1">Alumni Meet 2026 · Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            required
            autoComplete="email"
            placeholder="organizer@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="px-8 pb-6 text-center">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
            ← Back to registration
          </a>
        </div>
      </div>
    </main>
  )
}
