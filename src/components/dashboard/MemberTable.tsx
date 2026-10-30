'use client'
import { useState, useCallback, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import MemberDetailModal from './MemberDetailModal'
import { formatINR, formatDate } from '@/lib/format'
import type { Member } from '@/types/member'

interface MembersResponse {
  members: Member[]
  total: number
  page: number
  limit: number
  pages: number
}

type SortField = 'name' | 'classBatch' | 'contributionAmount' | 'numberOfAdults' | 'createdAt'
type SortDir   = 'asc' | 'desc'

interface FilterState {
  search: string
  classBatch: string
  hasContribution: 'all' | 'yes' | 'no'
  minAmount: string
  maxAmount: string
  sortBy: SortField
  sortDir: SortDir
  page: number
  limit: number
}

const defaultFilters: FilterState = {
  search: '', classBatch: '', hasContribution: 'all',
  minAmount: '', maxAmount: '',
  sortBy: 'createdAt', sortDir: 'desc', page: 1, limit: 20,
}

export default function MemberTable({ refreshKey }: { refreshKey?: number }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [data, setData]       = useState<MembersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const q = new URLSearchParams()
      q.set('page', String(filters.page))
      q.set('limit', String(filters.limit))
      q.set('sortBy', filters.sortBy)
      q.set('sortDir', filters.sortDir)
      if (filters.search)         q.set('search', filters.search)
      if (filters.classBatch)     q.set('classBatch', filters.classBatch)
      if (filters.hasContribution !== 'all') q.set('hasContribution', filters.hasContribution)
      if (filters.minAmount)      q.set('minAmount', filters.minAmount)
      if (filters.maxAmount)      q.set('maxAmount', filters.maxAmount)

      const res = await fetch(`/api/members?${q.toString()}`)
      if (!res.ok) { setError('Failed to load members.'); return }
      setData(await res.json())
    } catch { setError('Network error.') }
    finally   { setLoading(false) }
  }, [filters, refreshKey])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleMemberUpdated = (updated: Member) => {
    setData(prev => prev ? {
      ...prev,
      members: prev.members.map(m => m.phoneNumber === updated.phoneNumber ? updated : m),
    } : prev)
    setSelected(updated)
  }

  const handleMemberDeleted = (phoneNumber: string) => {
    setData(prev => prev ? {
      ...prev,
      members: prev.members.filter(m => m.phoneNumber !== phoneNumber),
      total: prev.total - 1,
    } : prev)
    setSelected(null)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const q = new URLSearchParams()
      if (filters.search)         q.set('search', filters.search)
      if (filters.classBatch)     q.set('classBatch', filters.classBatch)
      if (filters.hasContribution !== 'all') q.set('hasContribution', filters.hasContribution)
      const res = await fetch(`/api/export?${q.toString()}`)
      if (!res.ok) { alert('Export failed.'); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `alumni-meet-2026-${Date.now()}.csv`
      a.click(); URL.revokeObjectURL(url)
    } catch { alert('Export failed.') }
    finally   { setExporting(false) }
  }

  const setFilter = (key: keyof FilterState) => (value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const sortIcon = (field: SortField) => {
    if (filters.sortBy !== field) return '↕'
    return filters.sortDir === 'asc' ? '↑' : '↓'
  }

  const toggleSort = (field: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortBy:  field,
      sortDir: prev.sortBy === field && prev.sortDir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="search"
          placeholder="Search by name, phone, batch…"
          value={filters.search}
          onChange={e => setFilter('search')(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] col-span-1 lg:col-span-2"
        />
        <select
          value={filters.hasContribution}
          onChange={e => setFilter('hasContribution')(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        >
          <option value="all">All members</option>
          <option value="yes">With contribution</option>
          <option value="no">No contribution</option>
        </select>
        <Button
          variant="secondary"
          onClick={handleExport}
          loading={exporting}
          className="text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
            <tr>
              {[
                { label: 'Name',         field: 'name' as SortField },
                { label: 'Class / Batch',field: 'classBatch' as SortField },
                { label: 'Contribution', field: 'contributionAmount' as SortField },
                { label: 'Payment',      field: null },
                { label: 'Adults',       field: 'numberOfAdults' as SortField },
                { label: 'Registered',   field: 'createdAt' as SortField },
                { label: 'Action',       field: null },
              ].map(col => (
                <th
                  key={col.label}
                  className={`px-4 py-3 text-left ${col.field ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                  onClick={() => col.field && toggleSort(col.field)}
                >
                  {col.label} {col.field && <span className="text-gray-400">{sortIcon(col.field)}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.members.length === 0
              ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No members found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )
              : data?.members.map(m => (
                  <tr key={m.phoneNumber} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-3">
                      <Badge color="green">{m.classBatch}</Badge>
                    </td>
                    <td className={`px-4 py-3 font-medium ${Number(m.contributionAmount) > 0 ? 'text-[#155e36]' : 'text-gray-400'}`}>
                      {formatINR(m.contributionAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {m.paymentStatus === 'COMPLETED'
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2.5 py-1">✓ Completed</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">⏳ Pending</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.numberOfAdults}A / {m.numberOfKids}K</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(m)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))
          : data?.members.length === 0
          ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No members found.
              </div>
            )
          : data?.members.map(m => (
              <div key={m.phoneNumber} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <Badge color="green" className="mt-1">{m.classBatch}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(m)}>View</Button>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600 mt-1">
                  <span className={`font-medium ${Number(m.contributionAmount) > 0 ? 'text-[#155e36]' : 'text-gray-400'}`}>
                    {formatINR(m.contributionAmount)}
                  </span>
                  <span>· {m.numberOfAdults}A / {m.numberOfKids}K</span>
                  {m.paymentStatus === 'COMPLETED'
                    ? <span className="text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2 py-0.5">✓ Paid</span>
                    : <span className="text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">⏳ Pending</span>
                  }
                </div>
              </div>
            ))
        }
      </div>

      {data && data.total > 0 && (
        <Pagination
          page={data.page}
          pages={data.pages}
          total={data.total}
          limit={data.limit}
          onPage={p => setFilters(prev => ({ ...prev, page: p }))}
          onLimitChange={l => setFilters(prev => ({ ...prev, limit: l, page: 1 }))}
        />
      )}

      <MemberDetailModal
        member={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdated={handleMemberUpdated}
        onDeleted={handleMemberDeleted}
      />
    </div>
  )
}
