import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import './globals.css'
import '../styles/medieval.css'
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quest Visualizer - Next.js',
  description: 'A quest management and visualization tool with authentication and premium features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>
            <Toaster position="top-right" />
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
