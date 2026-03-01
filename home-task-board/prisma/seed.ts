import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed default expense categories
  const defaultCategories = [
    'Groceries',
    'Utilities',
    'Rent/Mortgage',
    'Transport',
    'Dining Out',
    'Entertainment',
    'Health',
    'Shopping',
    'Subscriptions',
    'Other',
  ]

  for (const name of defaultCategories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log(`Seeded ${defaultCategories.length} expense categories`)
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
