'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import toast from 'react-hot-toast';

export function SignInForm() {
  async function handleSignIn(provider: 'google' | 'github') {
    console.log('🚀 Starting sign in with:', provider);
    console.log('📅 Timestamp:', new Date().toISOString());
    
    const loadingToast = toast.loading('Redirecionando para login...');
    
    try {
      console.log('📞 Calling signIn function...');
      const res = await signIn(provider, { 
        redirect: true,
        callbackUrl: '/upgrade'
      });
      
      console.log('📝 SignIn result:', res);
      console.log('🎯 SignIn completed at:', new Date().toISOString());
      
      // O signIn redireciona, mas se não redirecionar, pode mostrar erro
      if (res?.error) {
        console.error('❌ SignIn error:', res.error);
        toast.dismiss(loadingToast);
        toast.error('Erro ao fazer login: ' + res.error);
      } else {
        console.log('✅ SignIn seems successful, expecting redirect...');
        toast.dismiss(loadingToast);
        toast.success('Login realizado com sucesso!');
      }
    } catch (e) {
      console.error('💥 SignIn exception:', e);
      console.error('💥 Exception details:', {
        message: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : 'No stack',
        timestamp: new Date().toISOString()
      });
      toast.dismiss(loadingToast);
      toast.error('Erro inesperado ao tentar login');
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Escolha como entrar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => handleSignIn('google')}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <FaGoogle className="w-4 h-4" />
          Entrar com Google
        </Button>
        <Button
          onClick={() => handleSignIn('github')}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <FaGithub className="w-4 h-4" />
          Entrar com GitHub
        </Button>
        <div className="text-center text-sm text-gray-600 mt-4">
          <p>Plano <strong>Free</strong>: Dados salvos localmente</p>
          <p>Plano <strong>Premium</strong>: Dados salvos na nuvem</p>
        </div>
      </CardContent>
    </Card>
  )
}
