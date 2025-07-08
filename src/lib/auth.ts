import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt: async ({ user, token, account }) => {
      console.log('🎫 JWT callback called at:', new Date().toISOString());
      console.log('🎫 JWT callback data:', { 
        user: user ? { id: user.id, email: user.email, name: user.name } : null,
        token: token ? { uid: token.uid, email: token.email, name: token.name } : null,
        account: account ? { provider: account.provider, type: account.type } : null
      });
      
      if (user) {
        console.log('👤 Setting user data in token');
        token.uid = user.id;
        token.email = user.email;
        token.name = user.name;
        console.log('✅ Token updated with user data:', { uid: token.uid, email: token.email, name: token.name });
      }
      
      return token;
    },
    session: async ({ session, token }) => {
      console.log('🔄 Session callback called at:', new Date().toISOString());
      console.log('🔄 Session callback input:', { 
        session: session ? { user: session.user } : null,
        token: token ? { uid: token.uid, email: token.email, name: token.name } : null
      });
      
      if (token && session?.user) {
        console.log('🔧 Adding user ID to session from token');
        session.user.id = token.uid as string;
        
        // Buscar informações adicionais do usuário do banco
        console.log('🔍 Searching user in database with ID:', token.uid);
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.uid as string },
          });
          console.log('📊 DB User found:', dbUser ? { 
            id: dbUser.id, 
            email: dbUser.email, 
            name: dbUser.name, 
            plan: dbUser.plan,
            createdAt: dbUser.createdAt
          } : null);
          
          if (dbUser) {
            session.user.plan = dbUser.plan === "PREMIUM" ? "PREMIUM" : dbUser.plan === "FREE" ? "FREE" : undefined;
            console.log('📋 Plan set on session:', session.user.plan);
          } else {
            console.log('⚠️ No user found in database');
          }
        } catch (dbError) {
          console.error('💾 Database error in session callback:', dbError);
        }
      }
      
      console.log('✅ Final session data:', { 
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          plan: session.user.plan
        } : null
      });
      return session;
    },
    async redirect({ baseUrl, url }) {
      console.log('🔀 Redirect callback called at:', new Date().toISOString());
      console.log('🔀 Redirect params:', { baseUrl, url });
      
      // Sempre redireciona para a seleção de planos após login
      const redirectUrl = `${baseUrl}/upgrade`;
      console.log('➡️ Redirecting to:', redirectUrl);
      console.log('🕐 Redirect timestamp:', new Date().toISOString());
      
      return redirectUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // false for localhost
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
}
