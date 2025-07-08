import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/auth/signin-form'

export default async function SignInPage() {
  console.log('🏠 SignIn page loading at:', new Date().toISOString());
  
  const session = await getServerSession(authOptions)
  
  console.log('🏠 SignIn page - Session:', session ? {
    user: {
      id: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
      plan: session.user?.plan
    }
  } : null);
  
  if (session) {
    console.log('✅ User is authenticated, redirecting to /');
    console.log('🕐 Redirect timestamp:', new Date().toISOString());
    redirect('/')
  }

  console.log('❌ No session found, showing login form');
  console.log('🕐 Login form shown at:', new Date().toISOString());
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quest Visualizer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para começar a criar suas quests
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
