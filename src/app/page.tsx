import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { QuestVisualizer } from '@/components/quest-visualizer'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  console.log('🏠 Home page - Session:', session);
  
  if (!session) {
    console.log('❌ No session, redirecting to signin');
    redirect('/auth/signin')
  }

  console.log('✅ User authenticated, showing Quest Visualizer');
  
  return (
    <main className="min-h-screen bg-background">
      <QuestVisualizer />
    </main>
  )
}
