import Link from 'next/link'
import { formatINR } from '@/lib/format'
import CloseButton from './CloseButton'

interface Props {
  searchParams: { name?: string; batch?: string; people?: string; amount?: string }
}

export default function SuccessPage({ searchParams }: Props) {
  const { name, batch, people, amount } = searchParams

  if (!name) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0d3321] via-[#155e36] to-[#0d3321] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <p className="text-gray-500 mb-6">No registration data found.</p>
          <Link href="/" className="text-[#155e36] hover:underline font-medium">← Back to registration</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0d3321] via-[#155e36] to-[#0d3321] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
        {/* Success banner */}
        <div className="bg-gradient-to-r from-[#155e36] to-[#1a7a44] px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">You're Registered!</h1>
          <p className="text-white/80 text-sm mt-2">We look forward to seeing you at Alumni Meet 2026</p>
        </div>

        {/* Summary */}
        <div className="p-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Registration Summary
          </h2>
          <dl className="space-y-3">
            {[
              { label: 'Name',        value: name },
              { label: 'Class / Batch', value: batch || '—' },
              { label: 'Attending',   value: `${people || 1} ${Number(people) === 1 ? 'person' : 'people'}` },
              {
                label: 'Contribution',
                value: formatINR(amount || 0),
                accent: Number(amount) > 0,
              },
              { label: 'Status',      value: '✅ Confirmed' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <dt className="text-sm text-gray-500">{row.label}</dt>
                <dd className={`text-sm font-semibold ${row.accent ? 'text-[#155e36]' : 'text-gray-900'}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 text-center space-y-3">
            <p className="text-xs text-gray-400">
              Please save a screenshot of this confirmation for your records.
            </p>

            {/* Close button — closes the tab/window */}
            <CloseButton />

            <Link
              href="/"
              className="block text-xs text-gray-400 hover:text-[#155e36] hover:underline"
            >
              ← Register another person
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
