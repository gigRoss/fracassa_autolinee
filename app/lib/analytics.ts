import { nowInItaly } from './dateUtils';
import { getDb } from './db';
import { analyticsEvents, userSessions } from './schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// ============================================================================
// LIVELLO 1: TRACKING ANONIMO (NO consent needed)
// ============================================================================

/**
 * Traccia un evento aggregato anonimo
 * Sicuro GDPR: nessun dato personale, solo statistiche aggregate
 */
export async function trackAnonymousEvent(
  eventType: string,
  eventData?: Record<string, any>
) {
  try {
    const db = getDb();
    const now = nowInItaly();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = now.getHours();

    const dataStr = eventData ? JSON.stringify(eventData) : null;

    // Cerca se esiste già un evento simile nella stessa ora
    const conditions = [
      eq(analyticsEvents.date, date),
      eq(analyticsEvents.hour, hour),
      eq(analyticsEvents.eventType, eventType),
    ];
    
    // Aggiungi condizione per eventData
    if (dataStr !== null) {
      conditions.push(eq(analyticsEvents.eventData, dataStr));
    } else {
      conditions.push(sql`${analyticsEvents.eventData} IS NULL`);
    }

    const existing = await db
      .select()
      .from(analyticsEvents)
      .where(and(...conditions))
      .limit(1);

    if (existing.length > 0) {
      // Incrementa il count
      await db
        .update(analyticsEvents)
        .set({
          count: sql`${analyticsEvents.count} + 1`,
          updatedAt: now,
        })
        .where(eq(analyticsEvents.id, existing[0].id));
    } else {
      // Crea nuovo record
      await db.insert(analyticsEvents).values({
        date,
        hour,
        eventType,
        eventData: dataStr,
        count: 1,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Analytics tracking error (anonymous):', error);
    // Non propagare errore - tracking non deve mai bloccare l'app
  }
}

/**
 * Helper specifici per eventi comuni
 */
export async function trackSearch(from: string, to: string) {
  return trackAnonymousEvent('search', { 
    route: `${from} → ${to}` 
  });
}

export async function trackRideView(rideId: string, lineName: string) {
  return trackAnonymousEvent('view_ride', { 
    rideId,
    lineName 
  });
}

export async function trackStopView(stopId: string, stopName: string) {
  return trackAnonymousEvent('view_stop', { 
    stopId,
    stopName 
  });
}

export async function trackPageview(path: string) {
  return trackAnonymousEvent('pageview', { path });
}

// ============================================================================
// QUERY FUNCTIONS - Per Dashboard Admin
// ============================================================================

/**
 * Ottieni top ricerche di oggi
 */
export async function getTopSearchesToday(limit: number = 10) {
  const db = getDb();
  const today = nowInItaly().toISOString().split('T')[0];

  const results = await db
    .select()
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.date, today),
        eq(analyticsEvents.eventType, 'search')
      )
    )
    .orderBy(desc(analyticsEvents.count))
    .limit(limit);

  return results.map(r => ({
    route: r.eventData ? JSON.parse(r.eventData).route : 'N/A',
    count: r.count,
  }));
}

/**
 * Ottieni statistiche di una giornata
 */
export async function getDailyStats(date: string) {
  const db = getDb();

  const events = await db
    .select({
      eventType: analyticsEvents.eventType,
      total: sql<number>`SUM(${analyticsEvents.count})`,
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.date, date))
    .groupBy(analyticsEvents.eventType);

  return events.reduce((acc, e) => {
    acc[e.eventType] = Number(e.total);
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Ottieni trend orario per un tipo di evento
 */
export async function getHourlyTrend(date: string, eventType: string) {
  const db = getDb();

  const hourly = await db
    .select({
      hour: analyticsEvents.hour,
      count: sql<number>`SUM(${analyticsEvents.count})`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.date, date),
        eq(analyticsEvents.eventType, eventType)
      )
    )
    .groupBy(analyticsEvents.hour)
    .orderBy(analyticsEvents.hour);

  return hourly.map(h => ({
    hour: h.hour,
    count: Number(h.count),
  }));
}

// ============================================================================
// LIVELLO 2: SESSION TRACKING (REQUIRES consent)
// ============================================================================

/**
 * Crea o aggiorna una sessione utente
 * IMPORTANTE: Chiamare SOLO se l'utente ha dato consenso cookie analytics
 */
export async function trackUserSession(
  sessionId: string,
  data: {
    userAgent?: string;
    language?: string;
    timezone?: string;
    screenResolution?: string;
    isPWA?: boolean;
  }
) {
  try {
    const db = getDb();
    const now = nowInItaly();

    const existing = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId))
      .limit(1);

    if (existing.length > 0) {
      // Aggiorna sessione esistente
      await db
        .update(userSessions)
        .set({
          lastSeen: now,
          pageviews: sql`${userSessions.pageviews} + 1`,
        })
        .where(eq(userSessions.id, sessionId));
    } else {
      // Crea nuova sessione
      await db.insert(userSessions).values({
        id: sessionId,
        firstSeen: now,
        lastSeen: now,
        pageviews: 1,
        events: null,
        userAgent: data.userAgent || null,
        language: data.language || null,
        timezone: data.timezone || null,
        screenResolution: data.screenResolution || null,
        isPWA: data.isPWA || false,
      });
    }
  } catch (error) {
    console.error('Session tracking error:', error);
  }
}

/**
 * Aggiungi evento a una sessione
 */
export async function addEventToSession(
  sessionId: string,
  eventType: string,
  eventData?: Record<string, any>
) {
  try {
    const db = getDb();
    const session = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId))
      .limit(1);

    if (session.length === 0) return;

    const existingEvents = session[0].events 
      ? JSON.parse(session[0].events) 
      : [];

    const newEvent = {
      type: eventType,
      data: eventData,
      timestamp: nowInItaly(), // Converti in timestamp numerico
    };

    const updatedEvents = [...existingEvents, newEvent];

    // Limita a ultimi 50 eventi per sessione (evita payload troppo grandi)
    if (updatedEvents.length > 50) {
      updatedEvents.shift();
    }

    await db
      .update(userSessions)
      .set({
        events: JSON.stringify(updatedEvents),
        lastSeen: nowInItaly(),
      })
      .where(eq(userSessions.id, sessionId));
  } catch (error) {
    console.error('Add event to session error:', error);
  }
}

/**
 * Ottieni statistiche sessioni (per admin dashboard)
 */
export async function getSessionStats() {
  const db = getDb();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stats = await db
    .select({
      totalSessions: sql<number>`COUNT(*)`,
      avgPageviews: sql<number>`AVG(${userSessions.pageviews})`,
      pwaInstalls: sql<number>`SUM(CASE WHEN ${userSessions.isPWA} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(userSessions)
    .where(sql`${userSessions.lastSeen} >= ${oneDayAgo}`);

  return stats[0];
}

/**
 * Ottieni ultime sessioni utente (per admin dashboard)
 */
export async function getRecentSessions(limit: number = 10) {
  const db = getDb();

  const sessions = await db
    .select()
    .from(userSessions)
    .orderBy(desc(userSessions.lastSeen))
    .limit(limit);

  return sessions.map(s => ({
    id: s.id.substring(0, 8), // Mostra solo primi 8 caratteri
    firstSeen: s.firstSeen,
    lastSeen: s.lastSeen,
    pageviews: s.pageviews,
    isPWA: s.isPWA,
    timezone: s.timezone,
    eventsCount: s.events ? JSON.parse(s.events).length : 0,
  }));
}

