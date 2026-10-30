/**
 * Seed script — creates the first organizer from environment variables.
 * Run once: npm run db:seed
 * Remove ORGANIZER_BOOTSTRAP_* from your environment after first run.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = process.env.ORGANIZER_BOOTSTRAP_EMAIL
  const password = process.env.ORGANIZER_BOOTSTRAP_PASSWORD
  const name     = process.env.ORGANIZER_BOOTSTRAP_NAME || 'Event Organizer'

  if (!email || !password) {
    console.error(
      '❌  Set ORGANIZER_BOOTSTRAP_EMAIL and ORGANIZER_BOOTSTRAP_PASSWORD before seeding.'
    )
    process.exit(1)
  }

  const existing = await prisma.organizer.findUnique({ where: { email } })
  if (existing) {
    console.log(`ℹ️  Organizer "${email}" already exists. Skipping.`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.organizer.create({ data: { email, name, passwordHash } })
  console.log(`✅  Organizer "${email}" created successfully.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
