import { getDb } from './db';
import { stops, rides, adminUsers } from './schema';
import { stops as initialStops, departures } from './data';
import { hashPassword } from './auth';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { nowInItaly } from './dateUtils';

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
    const now = nowInItaly();
    
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
    
    // Seed default admin user
    const adminEmail = 'admin@example.com';
    const adminExists = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, adminEmail));
    
    if (adminExists.length === 0) {
      const adminId = `admin-${Date.now()}-${randomBytes(4).toString('hex')}`;
      const adminPassword = 'admin123';
      const salt = randomBytes(16).toString('hex');
      const hash = hashPassword(adminPassword, salt);
      
      await db.insert(adminUsers).values({
        id: adminId,
        email: adminEmail,
        passwordHash: `${salt}:${hash}`,
        name: 'Admin User',
        createdAt: now,
      });
      
      console.log('✅ Default admin created:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
      console.log('   🚨 CHANGE THIS PASSWORD IN PRODUCTION!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();

