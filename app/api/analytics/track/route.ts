import { NextRequest, NextResponse } from 'next/server';
import { trackAnonymousEvent } from '@/app/lib/analytics';
import { z } from 'zod';

const TrackEventSchema = z.object({
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
    
    const { eventType, eventData } = TrackEventSchema.parse(body);

    // Fire and forget - non bloccare la risposta
    // L'evento verrà tracciato in background
    trackAnonymousEvent(eventType, eventData).catch(err => 
      console.error('[Analytics] Error tracking event:', err)
    );

    // Risposta immediata al client
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues }, 
        { status: 400 }
      );
    }
    
    console.error('[Analytics] Track error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

