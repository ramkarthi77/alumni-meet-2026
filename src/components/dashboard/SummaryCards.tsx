'use client'
import { StatCard } from '@/components/ui/Card'
import { formatINR } from '@/lib/format'

interface DashboardData {
  totalMembers: number
  totalAttendees: number
  totalContributions: string
  contributorCount: number
  zeroContributionCount: number
}

interface SummaryCardsProps {
  data: DashboardData | null
  loading?: boolean
}

function Skeleton() {
  return <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
}

export default function SummaryCards({ data, loading }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Registered Members',
      value: loading ? <Skeleton /> : String(data?.totalMembers ?? 0),
      color: 'green' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
        </svg>
      ),
    },
    {
      label: 'Total Expected Attendees',
      value: loading ? <Skeleton /> : String(data?.totalAttendees ?? 0),
      color: 'blue' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Total Contributions',
      value: loading ? <Skeleton /> : formatINR(data?.totalContributions ?? 0),
      color: 'gold' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Number of Contributors',
      value: loading ? <Skeleton /> : String(data?.contributorCount ?? 0),
      sub: 'Members who contributed',
      color: 'green' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'No Contribution',
      value: loading ? <Skeleton /> : String(data?.zeroContributionCount ?? 0),
      sub: 'Members with ₹0 contribution',
      color: 'red' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map(c => (
        <StatCard
          key={c.label}
          label={c.label}
          value={c.value as string}
          sub={c.sub}
          icon={c.icon}
          color={c.color}
        />
      ))}
    </div>
  )
}
