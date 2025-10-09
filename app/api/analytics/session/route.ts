import { NextRequest, NextResponse } from 'next/server';
import { trackUserSession } from '@/app/lib/analytics';
import { z } from 'zod';

const SessionSchema = z.object({
  sessionId: z.string().uuid(),
  userAgent: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  screenResolution: z.string().optional(),
  isPWA: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate body exists before parsing
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }
    
    const data = SessionSchema.parse(body);

    // Traccia la sessione utente (richiede consenso cookie)
    await trackUserSession(data.sessionId, {
      userAgent: data.userAgent,
      language: data.language,
      timezone: data.timezone,
      screenResolution: data.screenResolution,
      isPWA: data.isPWA,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues }, 
        { status: 400 }
      );
    }
    
    console.error('[Analytics] Session error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

