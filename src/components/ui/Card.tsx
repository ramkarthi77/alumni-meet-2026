import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-6', className)}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  color?: 'green' | 'gold' | 'blue' | 'red'
}

const statColors = {
  green: 'bg-green-50 text-green-700',
  gold:  'bg-amber-50 text-amber-700',
  blue:  'bg-blue-50 text-blue-700',
  red:   'bg-red-50 text-red-700',
}

export function StatCard({ label, value, sub, icon, color = 'green' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', statColors[color])}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
