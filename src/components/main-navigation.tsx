'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, LogOut, Database, HardDrive, BarChart3, Target, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MainNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isPremium = session?.user?.plan === 'PREMIUM'

  const navItems = [
    {
      href: '/',
      label: 'Quests',
      icon: Target,
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      href: '/account',
      label: 'Conta',
      icon: User,
    },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Quest Visualizer</h1>
              <Badge variant={isPremium ? "default" : "secondary"} className="flex items-center gap-1">
                {isPremium ? (
                  <>
                    <Crown className="w-3 h-3" />
                    Premium
                    <Database className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Free
                    <HardDrive className="w-3 h-3" />
                  </>
                )}
              </Badge>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              <p>Olá, {session?.user?.name}</p>
              <p className="text-xs">
                {isPremium ? 'Dados na nuvem' : 'Dados locais'}
              </p>
            </div>

            <Link href="/account">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Conta</span>
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex space-x-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
