'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, User, Lock, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name?: string | null
  email?: string | null
  plan?: 'FREE' | 'PREMIUM'
}

interface AccountManagementProps {
  user: User
}

export function AccountManagement({ user }: AccountManagementProps) {
  const { data: session, update } = useSession()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const isPremium = user.plan === 'PREMIUM'

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Senha alterada com sucesso!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setIsChangingPassword(false)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao alterar senha')
      }
    } catch (error) {
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanUpgrade = async () => {
    if (isPremium) {
      toast('Você já tem o plano Premium ativo!')
      return
    }
    try {
      // 1. Faz upgrade do plano
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, plan: 'PREMIUM' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao fazer upgrade');
        return;
      }

      // 2. Migra quests do localStorage para o backend
      const localQuests = JSON.parse(localStorage.getItem('quests') || '[]');
      for (const quest of localQuests) {
        try {
          await fetch('/api/quests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quest),
          });
        } catch (e) {
          // Se falhar, apenas loga
          console.error('Erro ao migrar quest:', quest, e);
        }
      }
      localStorage.removeItem('quests');

      toast.success('Upgrade realizado e dados migrados!');
      // 3. Atualiza a sessão para refletir o novo plano
      if (update) await update();
    } catch (e) {
      toast.error('Erro inesperado ao fazer upgrade');
    }
  }

  return (
    <div className="space-y-6">
      {/* Informações da Conta */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Informações da Conta</h2>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={user.name || ''}
              disabled
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email || ''}
              disabled
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Status da Conta</Label>
          <div className="mt-2">
            <Badge variant={isPremium ? "default" : "secondary"} className="flex items-center gap-2 w-fit">
              {isPremium ? (
                <>
                  <Crown className="w-4 h-4" />
                  Conta Premium
                </>
              ) : (
                'Conta Gratuita'
              )}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Plano */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Plano Atual</h2>
            <p className="text-gray-600">Gerencie sua assinatura</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isPremium ? (
                <Crown className="w-6 h-6 text-yellow-500" />
              ) : (
                <Shield className="w-6 h-6 text-gray-500" />
              )}
              <div>
                <h3 className="font-semibold">{isPremium ? 'Premium' : 'Gratuito'}</h3>
                <p className="text-sm text-gray-600">
                  {isPremium 
                    ? 'Acesso completo a todas as funcionalidades'
                    : 'Funcionalidades básicas disponíveis'
                  }
                </p>
              </div>
            </div>
            
            {!isPremium ? (
              <Button onClick={handlePlanUpgrade} className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Fazer Upgrade
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Ir para Dashboard
                </Button>
              </div>
            )}
          </div>

          {isPremium && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Benefícios Premium Ativos</span>
              </div>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>• Sincronização de dados na nuvem</li>
                <li>• Histórico de questões ilimitado</li>
                <li>• Recursos avançados de visualização</li>
                <li>• Suporte prioritário</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Segurança */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Segurança</h2>
            <p className="text-gray-600">Gerencie a segurança da sua conta</p>
          </div>
        </div>

        {!isChangingPassword ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Senha</h3>
                <p className="text-sm text-gray-600">
                  Altere sua senha para manter sua conta segura
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Alterar Senha
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                className="mt-1"
              />
            </div>

            {passwordForm.newPassword && passwordForm.confirmPassword && 
             passwordForm.newPassword !== passwordForm.confirmPassword && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                As senhas não coincidem
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading || passwordForm.newPassword !== passwordForm.confirmPassword}
                className="flex items-center gap-2"
              >
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false)
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
