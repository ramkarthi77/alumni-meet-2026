'use client'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { CLASS_BATCH_OPTIONS } from '@/lib/validation'

import type { Member } from '@/types/member'

interface EditMemberFormProps {
  member: Member
  onSuccess: (updated: Member) => void
  onCancel: () => void
}

export default function EditMemberForm({ member, onSuccess, onCancel }: EditMemberFormProps) {
  const [form, setForm] = useState({
    name:              member.name,
    classBatch:        member.classBatch,
    numberOfAdults:    String(member.numberOfAdults),
    numberOfKids:      String(member.numberOfKids),
    contributionAmount: String(member.contributionAmount),
  })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    setApiError('')
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim())  errs.name = 'Name is required'
    if (!form.classBatch)   errs.classBatch = 'Class / Batch is required'
    const na = parseInt(form.numberOfAdults)
    if (isNaN(na) || na < 1) errs.numberOfAdults = 'Must be at least 1'
    if (na > 20)              errs.numberOfAdults = 'Maximum 20'
    const nk = parseInt(form.numberOfKids)
    if (isNaN(nk) || nk < 0) errs.numberOfKids = 'Must be 0 or more'
    if (nk > 20)              errs.numberOfKids = 'Maximum 20'
    const ca = parseFloat(form.contributionAmount)
    if (isNaN(ca) || ca < 0) errs.contributionAmount = 'Must be 0 or more'
    return errs
  }

  async function doSave() {
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch(`/api/members/${encodeURIComponent(member.phoneNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              form.name.trim(),
          classBatch:        form.classBatch,
          numberOfAdults:    parseInt(form.numberOfAdults),
          numberOfKids:      parseInt(form.numberOfKids) || 0,
          contributionAmount: parseFloat(form.contributionAmount) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || 'Update failed. Please try again.')
        return
      }
      onSuccess(data)
    } catch {
      setApiError('Network error. Please try again.')
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setConfirm(true)
  }

  const classBatchOptions = CLASS_BATCH_OPTIONS.map(c => ({ value: c, label: c }))

  return (
    <>
      <form onSubmit={handleSave} className="space-y-4">
        <Input label="Full Name" value={form.name} onChange={set('name')} error={errors.name} required />
        <Select
          label="Class / Batch"
          value={form.classBatch}
          onChange={set('classBatch')}
          error={errors.classBatch}
          options={classBatchOptions}
          required
        />
        <Input
          label="Number of Adults"
          type="number" min={1} max={20}
          value={form.numberOfAdults}
          onChange={set('numberOfAdults')}
          error={errors.numberOfAdults}
          required
        />
        <Input
          label="Number of Kids"
          type="number" min={0} max={20}
          value={form.numberOfKids}
          onChange={set('numberOfKids')}
          error={errors.numberOfKids}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Contribution Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
            <input
              type="number" min={0} step="0.01"
              value={form.contributionAmount}
              onChange={set('contributionAmount')}
              className={`w-full rounded-lg border pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]
                ${errors.contributionAmount ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          {errors.contributionAmount && <p className="text-xs text-red-600">{errors.contributionAmount}</p>}
        </div>

        {apiError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{apiError}</div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1">Save Changes</Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirm}
        title="Confirm Update"
        message={`Save changes to ${member.name}'s record?`}
        confirmLabel="Yes, Save"
        loading={loading}
        onConfirm={doSave}
        onCancel={() => setConfirm(false)}
      />
    </>
  )
}
