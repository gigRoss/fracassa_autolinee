import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findAdminByEmail, verifyPassword, createSession, SESSION_COOKIE, updateLastAccess } from '@/app/lib/auth';

const TICKETS_ADMIN_EMAIL = 'admin@example.com';
const TICKETS_ADMIN_PASSWORD = 'admin456';
const DASHBOARD_ADMIN_PASSWORD = 'admin123';

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

    // Se è admin@example.com con password admin456 → reindirizza a biglietti
    if (emailLower === TICKETS_ADMIN_EMAIL && password === TICKETS_ADMIN_PASSWORD) {
      const token = createSession(emailLower);
      (await cookies()).set('tickets_admin_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
      return NextResponse.json({ 
        success: true, 
        redirectTo: '/admin/tickets/dashboard' 
      });
    }

    // Se è admin@example.com con password admin123 → reindirizza a dashboard corse
    if (emailLower === TICKETS_ADMIN_EMAIL && password === DASHBOARD_ADMIN_PASSWORD) {
      const user = await findAdminByEmail(emailLower);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Credenziali non valide' },
          { status: 401 }
        );
      }

      // Verifica password nel database
      if (!verifyPassword(password, user)) {
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

      return NextResponse.json({ 
        success: true, 
        redirectTo: '/admin/dashboard',
        role: role || 'amministrazione' 
      });
    }

    // Altrimenti verifica con il database degli admin (per altri utenti)
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

    return NextResponse.json({ 
      success: true, 
      redirectTo: '/admin/dashboard',
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

