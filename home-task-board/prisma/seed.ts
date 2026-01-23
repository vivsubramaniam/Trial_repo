import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default milestones
  const milestones = [
    { pointsRequired: 100, rewardName: 'Ice Cream Treat', description: 'A special ice cream outing for the family' },
    { pointsRequired: 250, rewardName: 'Movie Night', description: 'Pick any movie for family movie night' },
    { pointsRequired: 500, rewardName: 'Special Outing', description: 'Choose a fun activity for the weekend' },
    { pointsRequired: 1000, rewardName: 'Big Reward', description: 'A major reward of your choice!' },
  ]

  for (const milestone of milestones) {
    await prisma.milestone.upsert({
      where: { pointsRequired: milestone.pointsRequired },
      update: {},
      create: milestone,
    })
  }

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
