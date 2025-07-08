import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Database, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast';

// This page needs to be dynamic because it uses getServerSession
export const dynamic = 'force-dynamic'

export default async function UpgradePage() {
  console.log('📈 Upgrade page loading at:', new Date().toISOString());
  
  const session = await getServerSession(authOptions)
  
  console.log('📈 Upgrade page - Session:', session ? {
    user: {
      id: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
      plan: session.user?.plan
    }
  } : null);
  
  if (!session) {
    console.log('❌ No session, redirecting to signin');
    console.log('🕐 Redirect to signin timestamp:', new Date().toISOString());
    redirect('/auth/signin');
    return null;
  }
  
  // Redireciona para o dashboard se já tiver qualquer plano
  if (session.user.plan === 'PREMIUM' || session.user.plan === 'FREE') {
    console.log('✅ User has plan:', session.user.plan, 'redirecting to dashboard');
    console.log('🕐 Redirect to dashboard timestamp:', new Date().toISOString());
    redirect('/dashboard')
  }

  console.log('ℹ️ User needs to select a plan');
  console.log('🕐 Plan selection shown at:', new Date().toISOString());

  async function handleSelectPlan(plan: 'FREE' | 'PREMIUM') {
    try {
      if (!session || !session.user?.id) {
        toast.error('Sessão inválida. Faça login novamente.');
        return;
      }
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.user.id, plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao salvar plano');
        return;
      }
      toast.success('Plano salvo com sucesso! Redirecionando...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1200);
    } catch (e) {
      toast.error('Erro inesperado ao salvar plano');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Upgrade para Premium</h1>
          <p className="text-gray-600 mt-2">
            Desbloqueie recursos avançados e sincronização na nuvem
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Plano Free</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">R$ 0</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Criar quests ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Dados salvos localmente
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Interface completa
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Crown className="w-4 h-4" />
                  Sincronização na nuvem
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Database className="w-4 h-4" />
                  Backup automático
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => handleSelectPlan('FREE')}>
                Selecionar Plano Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-yellow-400 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-400 text-black">
                <Crown className="w-3 h-3 mr-1" />
                Recomendado
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Plano Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">Em breve</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Tudo do plano Free
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Sincronização na nuvem
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Backup automático
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Acesso em múltiplos dispositivos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Suporte prioritário
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleSelectPlan('PREMIUM')}
                disabled={session.user.plan === 'PREMIUM'}
              >
                Fazer upgrade para Premium
              </Button>
              <p className="text-xs text-gray-500 text-center">
                * Para demonstração, use o botão acima ou o script de upgrade no terminal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Para Desenvolvedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Este é um projeto de demonstração. Para testar o plano Premium, use o script de gerenciamento:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
              <div className="mb-2"># Upgrade para Premium:</div>
              <div className="text-blue-600">npm run upgrade-user {session.user.email}</div>
              <div className="mb-2 mt-4"># Downgrade para Free:</div>
              <div className="text-blue-600">npm run downgrade-user {session.user.email}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
