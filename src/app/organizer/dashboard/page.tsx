'use client'
import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { CLASS_BATCH_OPTIONS, GROUP_OPTIONS } from '@/lib/validation'

interface Member {
  phoneNumber: string
  name: string
  classBatch: string
  group?: string | null
  numberOfAdults: number
  numberOfKids: number
  contributionAmount: string
  paymentStatus?: 'PENDING' | 'COMPLETED'
  email?: string | null
  spouseName?: string | null
  dateOfBirth?: string | null
  marriageAnniversary?: string | null
  profession?: string | null
  createdAt?: string
}

interface Stats {
  totalMembers: number
  totalAmount: number
  totalAdults: number
  totalKids: number
  paidCount: number
  paidAmount: number
  pendingCount: number
  pendingAmount: number
}

const inp = (err?: boolean) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white
   ${err ? 'border-red-400' : 'border-gray-300'}`

function toDateInput(val?: string | null) {
  if (!val) return ''
  try { return new Date(val).toISOString().split('T')[0] } catch { return '' }
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#e8f5ee] flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [query, setQuery] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Member | null>(null)
  const [form, setForm] = useState<Partial<Member>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [tab, setTab] = useState<'list' | 'edit'>('list')
  const [smsBalance, setSmsBalance] = useState<{ balance: number | null; low: boolean } | null>(null)
  const [statusFilter, setStatusFilter] = useState<'' | 'PENDING' | 'COMPLETED'>('')

  // Load stats
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  // Load SMS balance for low-balance warning
  useEffect(() => {
    fetch('/api/dashboard/sms-balance')
      .then(r => r.json())
      .then(setSmsBalance)
      .catch(() => {})
  }, [])

  // Load members
  const loadMembers = useCallback(async (p = 1, q = query, sf = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50', sortBy: 'createdAt', sortDir: 'desc' })
      if (q.trim()) params.set('search', q.trim())
      if (sf) params.set('paymentStatus', sf)
      const res = await fetch(`/api/members?${params}`)
      const data = await res.json()
      setMembers(data.members ?? [])
      setTotal(data.total ?? 0)
      setPage(data.page ?? 1)
      setPages(data.pages ?? 1)
    } catch {
      setMsg({ type: 'err', text: 'Failed to load members.' })
    } finally { setLoading(false) }
  }, [query, statusFilter])

  useEffect(() => { loadMembers(1, '', '') }, []) // initial load — all members

  function search() { loadMembers(1, query, statusFilter) }

  function handleStatusFilter(sf: '' | 'PENDING' | 'COMPLETED') {
    setStatusFilter(sf)
    loadMembers(1, query, sf)
  }

  function select(m: Member) {
    setSelected(m)
    setMsg(null)
    setForm({
      name: m.name,
      classBatch: m.classBatch,
      group: m.group ?? '',
      numberOfAdults: m.numberOfAdults,
      numberOfKids: m.numberOfKids,
      contributionAmount: m.contributionAmount,
      paymentStatus: m.paymentStatus ?? 'PENDING',
      email: m.email ?? '',
      spouseName: m.spouseName ?? '',
      dateOfBirth: toDateInput(m.dateOfBirth),
      marriageAnniversary: toDateInput(m.marriageAnniversary),
      profession: m.profession ?? '',
    })
    setTab('edit')
  }

  async function save() {
    if (!selected) return
    setSaving(true); setMsg(null)
    try {
      const res = await fetch(`/api/members/${encodeURIComponent(selected.phoneNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          classBatch: form.classBatch,
          group: form.group || null,
          numberOfAdults: Number(form.numberOfAdults),
          numberOfKids: Number(form.numberOfKids),
          contributionAmount: Number(form.contributionAmount),
          paymentStatus: (form as Member).paymentStatus ?? 'PENDING',
          email: form.email || null,
          spouseName: form.spouseName || null,
          dateOfBirth: form.dateOfBirth || null,
          marriageAnniversary: form.marriageAnniversary || null,
          profession: form.profession || null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setMsg({ type: 'ok', text: `✓ ${data.name} updated successfully.` })
        setMembers(prev => prev.map(m =>
          m.phoneNumber === selected.phoneNumber ? { ...m, ...form } as Member : m
        ))
        // Refresh stats
        fetch('/api/dashboard/stats').then(r => r.json()).then(setStats).catch(() => {})
      } else {
        const data = await res.json()
        setMsg({ type: 'err', text: data.message || data.error || 'Save failed.' })
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error. Please try again.' })
    } finally { setSaving(false) }
  }

  const set = (f: keyof Member) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with school photo background */}
      <div className="relative h-28 sm:h-32 overflow-hidden">
        <img src="/school.png" alt="DVC Higher Secondary School" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-between px-6">
          <div>
            <h1 className="text-white font-bold text-lg">Alumni Meet 2026 · Organizer</h1>
            <p className="text-white/70 text-xs">DVC Higher Secondary School, Srimushnam</p>
          </div>
          <button onClick={async () => {
              await signOut({ redirect: false })
              window.location.href = '/organizer/login'
            }}
            className="text-white/70 hover:text-white text-sm border border-white/30 rounded-lg px-3 py-1.5">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ⚠️ SMS Balance Warning */}
        {smsBalance?.low && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Low SMS Balance — ₹{smsBalance.balance?.toFixed(2)}</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Members cannot register if balance hits ₹0. Please recharge at{' '}
                <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer"
                  className="underline font-medium">fast2sms.com</a>.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="space-y-3">
            {/* Row 1: Members + People */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon="👥" label="Total Members" value={stats.totalMembers} />
              <StatCard icon="💰" label="Total Collected" value={`₹${stats.totalAmount.toLocaleString('en-IN')}`} sub="all members" />
              <StatCard icon="🧑" label="Total Adults" value={stats.totalAdults} sub="18+ years" />
              <StatCard icon="🧒" label="Total Kids" value={stats.totalKids} sub="under 12" />
            </div>
            {/* Row 2: Paid vs Pending breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl flex-shrink-0">✅</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Paid</p>
                  <p className="text-xl font-bold text-green-700 truncate">₹{(stats.paidAmount ?? 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">{stats.paidCount ?? 0} {(stats.paidCount ?? 0) === 1 ? 'member' : 'members'}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">⏳</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Pending</p>
                  <p className="text-xl font-bold text-amber-700 truncate">₹{(stats.pendingAmount ?? 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">{stats.pendingCount ?? 0} {(stats.pendingCount ?? 0) === 1 ? 'member' : 'members'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab('list')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors
              ${tab === 'list' ? 'bg-[#155e36] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            👥 All Members ({total})
          </button>
          {selected && (
            <button onClick={() => setTab('edit')}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors
                ${tab === 'edit' ? 'bg-[#155e36] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              ✏️ Edit: {selected.name.split(' ')[0]}
            </button>
          )}
        </div>

        {/* Members List Tab */}
        {tab === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Search bar */}
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or phone number..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search()}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                />
                <button onClick={search} disabled={loading}
                  className="bg-[#155e36] hover:bg-[#1a7a44] text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-60">
                  {loading ? '…' : 'Search'}
                </button>
                {(query || statusFilter) && (
                  <button onClick={() => { setQuery(''); setStatusFilter(''); loadMembers(1, '', '') }}
                    className="text-gray-400 hover:text-gray-600 px-3 text-sm border border-gray-200 rounded-lg">
                    Clear
                  </button>
                )}
              </div>
              {/* Status filter */}
              <div className="flex gap-2">
                {(['', 'COMPLETED', 'PENDING'] as const).map(sf => (
                  <button key={sf} onClick={() => handleStatusFilter(sf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                      ${statusFilter === sf
                        ? sf === 'COMPLETED' ? 'bg-green-600 text-white border-green-600'
                          : sf === 'PENDING' ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-[#155e36] text-white border-[#155e36]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    {sf === '' ? '👥 All' : sf === 'COMPLETED' ? '✅ Paid' : '⏳ Pending'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table header */}
            {members.length > 0 && (
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Name / Phone</span>
                <span>Class · Group</span>
                <span className="text-center">Adults</span>
                <span className="text-center">Kids</span>
                <span className="text-right">Amount</span>
                <span className="text-center">Payment</span>
                <span className="text-center">Edit</span>
              </div>
            )}

            {/* Rows */}
            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
            ) : members.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No members found.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {members.map((m, i) => (
                  <div key={m.phoneNumber}
                    className={`grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-3 px-4 py-3 items-center hover:bg-[#f8fdf9] transition-colors
                      ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    {/* Name + phone */}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{m.phoneNumber}</p>
                    </div>
                    {/* Class · Group */}
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-700">{m.classBatch}</p>
                      {m.group && <span className="text-xs bg-[#e8f5ee] text-[#155e36] rounded px-1.5 py-0.5 font-semibold">{m.group}</span>}
                    </div>
                    {/* Adults */}
                    <div className="hidden md:flex justify-center">
                      <span className="text-sm font-semibold text-gray-800">{m.numberOfAdults}</span>
                    </div>
                    {/* Kids */}
                    <div className="hidden md:flex justify-center">
                      <span className="text-sm font-semibold text-gray-800">{m.numberOfKids}</span>
                    </div>
                    {/* Amount */}
                    <div className="hidden md:block text-right">
                      <span className="text-sm font-bold text-[#155e36]">₹{Number(m.contributionAmount).toLocaleString('en-IN')}</span>
                    </div>
                    {/* Payment Status */}
                    <div className="hidden md:flex justify-center">
                      {m.paymentStatus === 'COMPLETED'
                        ? <span className="text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2 py-0.5">✓ Paid</span>
                        : <span className="text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">⏳ Pending</span>
                      }
                    </div>
                    {/* Mobile: amount + edit button */}
                    <div className="flex items-center gap-2 md:hidden">
                      <span className="text-xs font-bold text-[#155e36]">₹{Number(m.contributionAmount).toLocaleString('en-IN')}</span>
                      <button onClick={() => select(m)}
                        className="text-[#155e36] border border-[#155e36]/30 rounded-lg px-2 py-1 text-xs font-medium hover:bg-[#e8f5ee]">
                        Edit
                      </button>
                    </div>
                    {/* Desktop edit */}
                    <div className="hidden md:flex justify-center">
                      <button onClick={() => select(m)}
                        className="text-[#155e36] border border-[#155e36]/30 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#e8f5ee] transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Page {page} of {pages} · {total} members</span>
                <div className="flex gap-2">
                  <button onClick={() => loadMembers(page - 1)} disabled={page <= 1}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                    ← Prev
                  </button>
                  <button onClick={() => loadMembers(page + 1)} disabled={page >= pages}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Tab */}
        {tab === 'edit' && selected && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Edit Member</h2>
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1 font-mono">{selected.phoneNumber}</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Full Name *</label>
              <input value={form.name ?? ''} onChange={set('name')} className={inp()} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Class / Batch *</label>
                <select value={form.classBatch ?? ''} onChange={set('classBatch')} className={inp()}>
                  {CLASS_BATCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Group</label>
                <select value={form.group ?? ''} onChange={set('group')} className={inp()}>
                  <option value="">— None —</option>
                  {GROUP_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Adults (18+) *</label>
                <input type="number" min={1} max={20} value={form.numberOfAdults ?? 1} onChange={set('numberOfAdults')} className={inp()} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Kids (under 12)</label>
                <input type="number" min={0} max={20} value={form.numberOfKids ?? 0} onChange={set('numberOfKids')} className={inp()} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Contribution Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input type="number" min={0} value={form.contributionAmount ?? 0} onChange={set('contributionAmount')}
                    className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Payment Status</label>
                <select value={(form as Member).paymentStatus ?? 'PENDING'} onChange={set('paymentStatus')} className={inp()}>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="COMPLETED">✓ Completed</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Email</label>
                <input type="email" value={form.email ?? ''} onChange={set('email')} className={inp()} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Spouse Name</label>
                  <input value={form.spouseName ?? ''} onChange={set('spouseName')} className={inp()} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Profession</label>
                  <input value={form.profession ?? ''} onChange={set('profession')} className={inp()} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth ?? ''} onChange={set('dateOfBirth')} className={inp()} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Marriage Anniversary</label>
                  <input type="date" value={form.marriageAnniversary ?? ''} onChange={set('marriageAnniversary')} className={inp()} />
                </div>
              </div>
            </div>

            {msg && (
              <div className={`rounded-xl p-3 text-sm ${msg.type === 'ok'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {msg.text}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setTab('list')}
                className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-3 font-medium text-sm hover:bg-gray-50">
                ← Back to List
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 bg-[#155e36] hover:bg-[#1a7a44] disabled:opacity-60 text-white rounded-xl py-3 font-semibold text-sm transition-colors">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
