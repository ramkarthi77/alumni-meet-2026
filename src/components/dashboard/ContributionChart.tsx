'use client'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatINR } from '@/lib/format'

const COLORS = ['#6b7280', '#3b82f6', '#f59e0b', '#10b981', '#155e36']

interface DistributionItem {
  label: string
  count: number
  percentage: number
  total: string
}

interface ContributionChartProps {
  distribution: DistributionItem[]
  totalContributions: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{d.label}</p>
      <p className="text-gray-600">{d.count} member{d.count !== 1 ? 's' : ''} ({d.percentage}%)</p>
      <p className="text-[#155e36] font-medium">{formatINR(d.total)}</p>
    </div>
  )
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
  if (percentage < 5) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${percentage}%`}
    </text>
  )
}

export default function ContributionChart({ distribution, totalContributions }: ContributionChartProps) {
  const data = distribution.filter(d => d.count > 0)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">No registrations yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Collected</p>
        <p className="text-2xl font-bold text-[#155e36]">{formatINR(totalContributions)}</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={55}
            paddingAngle={2}
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => <span className="text-xs text-gray-700">{v}</span>}
            iconSize={10}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
