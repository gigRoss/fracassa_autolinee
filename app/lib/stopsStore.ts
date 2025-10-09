import { getDb } from './db';
import { stops, rides as ridesTable, intermediateStops as intermediateTable } from './schema';
import { eq, or } from 'drizzle-orm';
import type { Stop } from './data';
import { nowInItaly } from './dateUtils';

/**
 * List all stops from database
 * @returns Array of stops (compatible with data.ts Stop type)
 */
export async function listStops(): Promise<Stop[]> {
  const db = getDb();
  const result = await db.select({
    id: stops.id,
    name: stops.name,
    city: stops.city,
  }).from(stops);
  return result;
}

/**
 * Get stop by ID from database
 * @param id Stop ID
 * @returns Stop or undefined if not found
 */
export async function getStopById(id: string): Promise<Stop | undefined> {
  const db = getDb();
  const result = await db.select({
    id: stops.id,
    name: stops.name,
    city: stops.city,
  }).from(stops).where(eq(stops.id, id)).limit(1);
  return result[0];
}

/**
 * Create new stop in database
 * @param stop Stop data without ID
 * @returns Created stop
 * @throws Error if duplicate ID constraint violation (retries with new ID)
 */
export async function createStop(stop: Omit<Stop, "id">): Promise<Stop> {
  const db = getDb();
  
  // Retry logic for duplicate ID (unlikely but possible with timestamp-based IDs)
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const id = `s${Date.now()}-${attempts}`;
      
      // Insert without returning (Turso compatibility)
      await db.insert(stops).values({
        id,
        name: stop.name,
        city: stop.city,
        createdAt: nowInItaly(),
        updatedAt: nowInItaly(),
      });
      
      // Fetch the created stop
      const created = await getStopById(id);
      if (!created) {
        throw new Error('Failed to retrieve created stop');
      }
      
      return created;
    } catch (error: any) {
      // Check if it's a constraint violation (SQLITE_CONSTRAINT = 19)
      if (error?.code === 'SQLITE_CONSTRAINT' || error?.message?.includes('UNIQUE')) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Failed to create stop: duplicate ID after retries');
        }
        // Wait 1ms before retry to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 1));
        continue;
      }
      // Re-throw other errors
      throw error;
    }
  }
  
  throw new Error('Failed to create stop: max attempts exceeded');
}


/**
 * Update an existing stop (name/city). Returns updated Stop or undefined if not found
 */
export async function updateStop(id: string, update: Partial<Omit<Stop, 'id'>>): Promise<Stop | undefined> {
  const db = getDb();
  const existing = await getStopById(id);
  if (!existing) return undefined;

  await db
    .update(stops)
    .set({
      name: update.name ?? existing.name,
      city: update.city ?? existing.city,
      updatedAt: nowInItaly(),
    })
    .where(eq(stops.id, id));

  return await getStopById(id);
}

/**
 * Delete a stop if not referenced by any ride (origin/destination) or intermediate stop.
 * Throws Error if the stop is in use.
 */
export async function deleteStop(id: string): Promise<void> {
  const db = getDb();

  // Check references in rides (as origin or destination)
  const usedInRide = await db
    .select({ id: ridesTable.id })
    .from(ridesTable)
    .where(or(eq(ridesTable.originStopId, id), eq(ridesTable.destinationStopId, id)))
    .limit(1);

  if (usedInRide.length > 0) {
    throw new Error('La fermata è utilizzata in una o più corse');
  }

  // Check references in intermediate stops
  const usedInIntermediate = await db
    .select({ id: intermediateTable.id })
    .from(intermediateTable)
    .where(eq(intermediateTable.stopId, id))
    .limit(1);

  if (usedInIntermediate.length > 0) {
    throw new Error('La fermata è utilizzata come fermata intermedia in una o più corse');
  }

  await db.delete(stops).where(eq(stops.id, id));
}


