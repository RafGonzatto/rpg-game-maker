import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default factions
  const factions = [
    { name: "Gangue Rival", bgColor: "#ef4444", borderColor: "#b91c1c" },
    { name: "Negócios", bgColor: "#3b82f6", borderColor: "#1e40af" },
    { name: "Combate", bgColor: "#10b981", borderColor: "#047857" },
    { name: "Tutorial", bgColor: "#f59e0b", borderColor: "#d97706" },
    { name: "Diplomacia", bgColor: "#6366f1", borderColor: "#4f46e5" },
    { name: "Aliados", bgColor: "#8b5cf6", borderColor: "#7c3aed" },
  ]

  for (const faction of factions) {
    await prisma.faction.upsert({
      where: { name: faction.name },
      update: {},
      create: faction,
    })
  }

  // Create default quest types
  const types = [
    "Cutscene",
    "Diálogo",
    "Batalha",
    "Negociação",
    "Recrutamento",
    "Acordo",
  ]

  for (const type of types) {
    await prisma.questType.upsert({
      where: { name: type },
      update: {},
      create: { name: type },
    })
  }

  // Create a demo user (for development)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      plan: 'PREMIUM',
    },
  })

  console.log('Seed data created successfully!')
  console.log(`Demo user ID: ${demoUser.id}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
