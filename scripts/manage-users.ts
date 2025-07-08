import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upgradeToPremium(userEmail: string) {
  try {
    const user = await prisma.user.update({
      where: { email: userEmail },
      data: { plan: 'PREMIUM' },
    })
    
    console.log(`✅ User ${userEmail} upgraded to PREMIUM plan`)
    console.log(`User ID: ${user.id}`)
    return user
  } catch (error) {
    console.error('❌ Error upgrading user:', error)
    throw error
  }
}

async function downgradeTofree(userEmail: string) {
  try {
    const user = await prisma.user.update({
      where: { email: userEmail },
      data: { plan: 'FREE' },
    })
    
    console.log(`⬇️ User ${userEmail} downgraded to FREE plan`)
    console.log(`User ID: ${user.id}`)
    return user
  } catch (error) {
    console.error('❌ Error downgrading user:', error)
    throw error
  }
}

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            quests: true,
          },
        },
      },
    })
    
    console.log('\n📋 Users List:')
    console.log('─'.repeat(80))
    
    users.forEach((user) => {
      console.log(`👤 ${user.name || 'No name'} (${user.email})`)
      console.log(`   Plan: ${user.plan === 'PREMIUM' ? '👑 PREMIUM' : '🆓 FREE'}`)
      console.log(`   Quests: ${user._count.quests}`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log('─'.repeat(40))
    })
  } catch (error) {
    console.error('❌ Error listing users:', error)
    throw error
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2]
  const email = process.argv[3]

  switch (command) {
    case 'upgrade':
      if (!email) {
        console.error('❌ Email is required for upgrade command')
        console.log('Usage: npm run upgrade-user <email>')
        process.exit(1)
      }
      await upgradeToPremium(email)
      break

    case 'downgrade':
      if (!email) {
        console.error('❌ Email is required for downgrade command')
        console.log('Usage: npm run downgrade-user <email>')
        process.exit(1)
      }
      await downgradeTofree(email)
      break

    case 'list':
      await listUsers()
      break

    default:
      console.log('📋 Available commands:')
      console.log('  npm run upgrade-user <email>   - Upgrade user to PREMIUM')
      console.log('  npm run downgrade-user <email> - Downgrade user to FREE')
      console.log('  npm run list-users             - List all users')
      console.log('')
      console.log('Examples:')
      console.log('  npm run upgrade-user user@example.com')
      console.log('  npm run list-users')
  }
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
