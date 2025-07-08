import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { QuestVisualizer } from '@/components/quest-visualizer'
import Link from 'next/link'

// This page needs to be dynamic because it uses getServerSession
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    console.log('🏠 Home page loading...');
    
    const session = await getServerSession(authOptions)
    console.log('🔍 Session check:', !!session);
    
    if (!session) {
      console.log('❌ No session, showing login options');
      return (
        <main className="min-h-screen bg-background">
          <div className="container mx-auto p-4">
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold text-center mb-8">Quest Visualizer</h1>
              <p className="text-lg text-center mb-8 max-w-2xl">
                Uma ferramenta poderosa para visualizar e gerenciar suas quests e missões de RPG.
              </p>
              <div className="space-y-4">
                <Link 
                  href="/auth/signin"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Fazer Login
                </Link>
                <p className="text-sm text-gray-600 text-center">
                  Faça login para acessar todas as funcionalidades
                </p>
              </div>
            </div>
          </div>
        </main>
      )
    }

    console.log('✅ User authenticated, showing Quest Visualizer');
    
    return (
      <main className="min-h-screen bg-background">
        <QuestVisualizer />
      </main>
    )
  } catch (error) {
    console.error('❌ Error in HomePage:', error);
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Quest Visualizer</h1>
          <p className="text-lg mb-4">Bem-vindo ao Quest Visualizer!</p>
          <Link 
            href="/auth/signin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Fazer Login
          </Link>
        </div>
      </main>
    )
  }
}
