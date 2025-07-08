import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('💾 Plan API called at:', new Date().toISOString());
  
  const session = await getServerSession(authOptions);
  console.log('💾 Session in plan API:', session ? {
    user: {
      id: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
      plan: session.user?.plan
    }
  } : null);
  
  if (!session || !session.user?.id) {
    console.log('❌ Not authenticated in plan API');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const { plan } = await req.json();
  console.log('💾 Requested plan:', plan);
  
  if (plan !== 'FREE' && plan !== 'PREMIUM') {
    console.log('❌ Invalid plan requested:', plan);
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
  }
  
  try {
    console.log('💾 Updating user plan in database...');
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { plan },
    });
    console.log('✅ User plan updated successfully:', {
      id: updatedUser.id,
      email: updatedUser.email,
      plan: updatedUser.plan
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('💾 Error updating user plan:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
