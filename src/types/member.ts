/** Shared Member shape used across table, modal, and edit form */
export interface Member {
  phoneNumber: string
  name: string
  classBatch: string
  group?: string | null
  numberOfAdults: number
  numberOfKids: number
  contributionAmount: string
  paymentStatus: 'PENDING' | 'COMPLETED'
  email?: string | null
  spouseName?: string | null
  dateOfBirth?: string | null
  marriageAnniversary?: string | null
  profession?: string | null
  createdAt: string
  updatedAt: string
}
