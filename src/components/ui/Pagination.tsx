'use client'
import Button from './Button'

interface PaginationProps {
  page: number
  pages: number
  total: number
  limit: number
  onPage: (p: number) => void
  onLimitChange: (l: number) => void
}

export default function Pagination({ page, pages, total, limit, onPage, onLimitChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Show</span>
        <select
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        >
          {[20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>per page · {from}–{to} of {total}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
        >
          ← Prev
        </Button>
        <span className="text-sm text-gray-600 px-2">
          Page {page} / {pages || 1}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}
