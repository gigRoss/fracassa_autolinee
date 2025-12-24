import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findAdminByEmail, verifyPassword, createSession, SESSION_COOKIE, updateLastAccess } from '@/app/lib/auth';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password obbligatorie' },
        { status: 400 }
      );
    }

    const emailLower = email.trim().toLowerCase();

    // Verifica con il database degli admin
    const user = await findAdminByEmail(emailLower);
    
    if (!user || !verifyPassword(password, user)) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    await updateLastAccess(user.email);
    const token = createSession(user.email);
    
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // Redirect sempre a /admin/general dopo il login
    return NextResponse.json({ 
      success: true, 
      redirectTo: '/admin/general',
      role: role || 'amministrazione' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

