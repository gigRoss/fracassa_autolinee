import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/app/lib/auth';

// Credenziali specifiche per la gestione biglietti
// Stesso email ma password diversa da quella della dashboard corse
const TICKETS_ADMIN_EMAIL = 'admin@example.com';
const TICKETS_ADMIN_PASSWORD = 'admin456';

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

    // Verifica credenziali specifiche per biglietti
    // Accetta solo admin@example.com con password admin456
    if (email.trim().toLowerCase() !== TICKETS_ADMIN_EMAIL || password !== TICKETS_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Crea una sessione per i biglietti (non usa il database degli admin)
    // Usa un token semplice basato sull'email
    const token = createSession(email.trim().toLowerCase());
    
    // Set cookie with specific name for tickets admin
    (await cookies()).set('tickets_admin_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tickets login error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

