'use client'
import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EditMemberForm from '@/components/forms/EditMemberForm'
import { formatINR, formatDate } from '@/lib/format'
import { maskPhone } from '@/lib/phone'
import type { Member } from '@/types/member'

interface MemberDetailModalProps {
  member: Member | null
  open: boolean
  onClose: () => void
  onUpdated: (m: Member) => void
  onDeleted: (phoneNumber: string) => void
}

export default function MemberDetailModal({
  member, open, onClose, onUpdated, onDeleted,
}: MemberDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [showFullPhone, setShowFullPhone] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  if (!member) return null

  const handleUpdated = (updated: Member) => {
    setEditing(false)
    onUpdated(updated)
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(
        `/api/members/${encodeURIComponent(member.phoneNumber)}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setDeleteError(body.error ?? 'Delete failed. Please try again.')
        setDeleting(false)
        return
      }
      setConfirmDelete(false)
      onDeleted(member.phoneNumber)
      onClose()
    } catch {
      setDeleteError('Network error. Please try again.')
      setDeleting(false)
    }
  }

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-50 last:border-0">
      <dt className="text-sm font-medium text-gray-500 sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 mt-1 sm:mt-0">{value}</dd>
    </div>
  )

  return (
    <>
      <Modal
        open={open}
        onClose={() => { setEditing(false); setDeleteError(''); onClose() }}
        title={editing ? 'Edit Member' : 'Member Details'}
        size="md"
      >
        {editing ? (
          <EditMemberForm
            member={member}
            onSuccess={handleUpdated}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <dl className="divide-y divide-gray-50">
              <Row label="Full Name" value={
                <span className="font-medium">{member.name}</span>
              } />
              <Row label="Phone Number" value={
                <span className="font-mono flex items-center gap-2">
                  {showFullPhone ? member.phoneNumber : maskPhone(member.phoneNumber)}
                  <button
                    onClick={() => setShowFullPhone(p => !p)}
                    className="text-xs text-[#155e36] hover:underline"
                  >
                    {showFullPhone ? 'Hide' : 'Show full'}
                  </button>
                </span>
              } />
              <Row label="Class / Batch" value={
                <Badge color="green">{member.classBatch}</Badge>
              } />
              <Row label="Adults" value={<span>{member.numberOfAdults} adult{member.numberOfAdults === 1 ? '' : 's'}</span>} />
              <Row label="Kids"   value={<span>{member.numberOfKids} kid{member.numberOfKids === 1 ? '' : 's'}</span>} />
              <Row label="Payment Status" value={
                member.paymentStatus === 'COMPLETED'
                  ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2.5 py-1">✓ Completed</span>
                  : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">⏳ Pending</span>
              } />
              <Row label="Contribution" value={
                <span className={`font-semibold ${Number(member.contributionAmount) > 0 ? 'text-[#155e36]' : 'text-gray-400'}`}>
                  {formatINR(member.contributionAmount)}
                </span>
              } />
              <Row label="Registered On" value={formatDate(member.createdAt)} />
              <Row label="Last Updated"  value={formatDate(member.updatedAt)} />
            </dl>

            {deleteError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{deleteError}</p>
            )}

            {/* Action buttons — Close | Edit | Delete */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="secondary" className="sm:flex-1" onClick={onClose}>
                Close
              </Button>
              <Button className="sm:flex-1" onClick={() => setEditing(true)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <button
                onClick={() => { setDeleteError(''); setConfirmDelete(true) }}
                className="sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                           bg-red-50 text-red-700 border border-red-200 font-medium text-sm
                           hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Member"
        message={
          `Are you sure you want to permanently delete ${member.name}'s registration?\n` +
          `This cannot be undone.`
        }
        confirmLabel={deleting ? 'Deleting…' : 'Yes, Delete'}
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
