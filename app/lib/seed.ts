import { getDb } from './db';
import { stops, rides } from './schema';
import { stops as initialStops, departures } from './data';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Seed database with initial stops and rides data
 * Run with: npm run db:seed
 */
async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    const db = getDb();
    const now = new Date();
    
    // Upsert stops
    for (const stop of initialStops) {
      const exists = await db.select({ id: stops.id }).from(stops).where(eq(stops.id, stop.id));
      if (exists.length === 0) {
        await db.insert(stops).values({
          id: stop.id,
          name: stop.name,
          city: stop.city,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    console.log(`✅ Ensured ${initialStops.length} stops present`);
    
    // Upsert rides (ensure any missing from data.ts are inserted)
    for (const departure of departures) {
      const exists = await db.select({ id: rides.id }).from(rides).where(eq(rides.id, departure.id));
      if (exists.length === 0) {
        await db.insert(rides).values({
          id: departure.id,
          lineName: departure.lineName,
          originStopId: departure.originStopId,
          destinationStopId: departure.destinationStopId,
          departureTime: departure.departureTime,
          arrivalTime: departure.arrivalTime,
          archived: false,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`➕ Inserted ride ${departure.id} (${departure.lineName})`);
      }
    }
    console.log(`✅ Ensured ${departures.length} rides present`);
    
    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();

