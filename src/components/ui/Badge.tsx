import { cn } from '@/lib/cn'

interface BadgeProps {
  children: React.ReactNode
  color?: 'green' | 'gold' | 'gray' | 'red'
  className?: string
}

const colors = {
  green: 'bg-green-100 text-green-800',
  gold:  'bg-amber-100 text-amber-800',
  gray:  'bg-gray-100 text-gray-700',
  red:   'bg-red-100 text-red-700',
}

export default function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colors[color],
      className
    )}>
      {children}
    </span>
  )
}
