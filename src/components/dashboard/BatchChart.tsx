'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatINR } from '@/lib/format'

interface BatchStat {
  classBatch: string
  memberCount: number
  totalContribution: string
  totalPeople: number
}

interface BatchChartProps {
  batchStats: BatchStat[]
}

export default function BatchChart({ batchStats }: BatchChartProps) {
  if (!batchStats.length) return null

  const data = batchStats.map(b => ({
    name:    b.classBatch.length > 10 ? b.classBatch.slice(0, 10) + '…' : b.classBatch,
    fullName: b.classBatch,
    amount:   Number(b.totalContribution),
    members:  b.memberCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, _n: any, p: any) => [
            `${formatINR(v)} (${p.payload.members} members)`,
            'Contribution',
          ]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(l: any, p: any) => p[0]?.payload?.fullName ?? l}
          contentStyle={{ borderRadius: 12, fontSize: 12 }}
        />
        <Bar dataKey="amount" fill="#155e36" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
