import { z } from 'zod'

export const CLASS_BATCH_OPTIONS = [
  '6th Standard',
  '7th Standard',
  '8th Standard',
  '9th Standard',
  '10th Standard',
  '11th Science',
  '11th Commerce',
  '11th Arts',
  '12th Science',
  '12th Commerce',
  '12th Arts',
  'Other',
] as const

export const GROUP_OPTIONS = [
  'A', 'A1', 'A2',
  'B', 'B1', 'B2',
  'C', 'C1', 'C2',
  'D', 'D1', 'D2',
] as const

// Helper: optional string field that accepts null, undefined, or ''
const optStr = (max = 200) =>
  z.union([z.string().max(max), z.null(), z.undefined()]).transform(v => v || null)

// Optional email: validate format only when non-empty
const optEmail = z.union([
  z.string().email('Invalid email address').max(255),
  z.literal(''),
  z.null(),
  z.undefined(),
]).transform(v => v || null)

export const registerSchema = z.object({
  name:               z.string().min(1, 'Name is required').max(200).transform(s => s.trim()),
  phoneNumber:        z.string().min(5, 'Phone number is required').max(20),
  classBatch:         z.string().min(1, 'Class / Batch is required').max(100).transform(s => s.trim()),
  group:              optStr(10),
  numberOfAdults:     z.number().int().min(1, 'At least 1 adult required').max(20),
  numberOfKids:       z.number().int().min(0).max(20).default(0),
  contributionAmount: z.number().min(0, 'Cannot be negative').max(1_000_000),
  email:              optEmail,
  spouseName:         optStr(200),
  dateOfBirth:        optStr(30),
  marriageAnniversary: optStr(30),
  profession:         optStr(200),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const updateMemberSchema = z.object({
  name:               z.string().min(1).max(200).transform(s => s.trim()).optional(),
  classBatch:         z.string().min(1).max(100).transform(s => s.trim()).optional(),
  group:              optStr(10).optional(),
  numberOfAdults:     z.number().int().min(1).max(20).optional(),
  numberOfKids:       z.number().int().min(0).max(20).optional(),
  contributionAmount: z.number().min(0).max(1_000_000).optional(),
  paymentStatus:      z.enum(['PENDING', 'COMPLETED']).optional(),
  email:              optEmail.optional(),
  spouseName:         optStr(200).optional(),
  dateOfBirth:        optStr(30).optional(),
  marriageAnniversary: optStr(30).optional(),
  profession:         optStr(200).optional(),
})

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>

export const memberQuerySchema = z.object({
  page:    z.coerce.number().int().min(1).default(1),
  limit:   z.coerce.number().int().refine(v => [20, 50, 100].includes(v)).default(20),
  search:  z.string().max(200).optional(),
  classBatch: z.string().max(100).optional(),
  hasContribution: z.enum(['yes', 'no', 'all']).default('all'),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  sortBy:  z.enum(['name', 'classBatch', 'contributionAmount', 'numberOfAdults', 'createdAt']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
})

export type MemberQuery = z.infer<typeof memberQuerySchema>

export const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
