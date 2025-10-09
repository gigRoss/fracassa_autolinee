import { NextRequest, NextResponse } from 'next/server';
import { addEventToSession } from '@/app/lib/analytics';
import { z } from 'zod';

const SessionEventSchema = z.object({
  sessionId: z.string().uuid(),
  eventType: z.string().min(1).max(50),
  eventData: z.record(z.string(), z.any()).optional(),
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
    
    const { sessionId, eventType, eventData } = SessionEventSchema.parse(body);

    // Aggiungi evento alla sessione utente
    // Fire and forget per non bloccare la risposta
    addEventToSession(sessionId, eventType, eventData).catch(err =>
      console.error('[Analytics] Session event error:', err)
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('[Analytics] Session event error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

