import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findAdminByEmail, verifyPassword, createSession, SESSION_COOKIE, updateLastAccess } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password obbligatorie' },
        { status: 400 }
      );
    }

    const user = await findAdminByEmail(email.trim().toLowerCase());
    
    if (!user || !verifyPassword(password, user)) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Update last access timestamp
    await updateLastAccess(user.email);

    // Create session token
    const token = createSession(user.email);
    
    // Set cookie
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

