import { getDb } from "./db";
import { intermediateStops, rides, stops } from "./schema";
import { eq, and, inArray } from "drizzle-orm";
import { nowInItaly } from "./dateUtils";

export type IntermediateStopWithDetails = {
  id: number;
  rideId: string;
  stopId: string;
  arrivalTime: string;
  stopOrder: number;
  // Additional details from joins
  rideLineName: string | null;
  stopName: string | null;
  stopCity: string | null;
};

export type IntermediateStopInput = {
  rideId: string;
  stopId: string;
  arrivalTime: string;
  stopOrder: number;
};

/**
 * List all intermediate stops from the database
 */
export async function listIntermediateStops(): Promise<IntermediateStopWithDetails[]> {
  const db = getDb();
  
  const result = await db
    .select({
      id: intermediateStops.id,
      rideId: intermediateStops.rideId,
      stopId: intermediateStops.stopId,
      arrivalTime: intermediateStops.arrivalTime,
      stopOrder: intermediateStops.stopOrder,
      rideLineName: rides.lineName,
      stopName: stops.name,
      stopCity: stops.city,
    })
    .from(intermediateStops)
    .leftJoin(rides, eq(intermediateStops.rideId, rides.id))
    .leftJoin(stops, eq(intermediateStops.stopId, stops.id))
    .orderBy(intermediateStops.stopOrder);

  return result;
}

/**
 * Get intermediate stop by ID
 */
export async function getIntermediateStopById(id: number): Promise<IntermediateStopWithDetails | undefined> {
  const db = getDb();
  
  const result = await db
    .select({
      id: intermediateStops.id,
      rideId: intermediateStops.rideId,
      stopId: intermediateStops.stopId,
      arrivalTime: intermediateStops.arrivalTime,
      stopOrder: intermediateStops.stopOrder,
      rideLineName: rides.lineName,
      stopName: stops.name,
      stopCity: stops.city,
    })
    .from(intermediateStops)
    .leftJoin(rides, eq(intermediateStops.rideId, rides.id))
    .leftJoin(stops, eq(intermediateStops.stopId, stops.id))
    .where(eq(intermediateStops.id, id))
    .limit(1);

  return result[0];
}

/**
 * Get all intermediate stops for a specific ride
 */
export async function getIntermediateStopsByRideId(rideId: string): Promise<IntermediateStopWithDetails[]> {
  const db = getDb();
  
  const result = await db
    .select({
      id: intermediateStops.id,
      rideId: intermediateStops.rideId,
      stopId: intermediateStops.stopId,
      arrivalTime: intermediateStops.arrivalTime,
      stopOrder: intermediateStops.stopOrder,
      rideLineName: rides.lineName,
      stopName: stops.name,
      stopCity: stops.city,
    })
    .from(intermediateStops)
    .leftJoin(rides, eq(intermediateStops.rideId, rides.id))
    .leftJoin(stops, eq(intermediateStops.stopId, stops.id))
    .where(eq(intermediateStops.rideId, rideId))
    .orderBy(intermediateStops.stopOrder);

  return result;
}

/**
 * Get all intermediate stops for a specific stop
 */
export async function getIntermediateStopsByStopId(stopId: string): Promise<IntermediateStopWithDetails[]> {
  const db = getDb();
  
  const result = await db
    .select({
      id: intermediateStops.id,
      rideId: intermediateStops.rideId,
      stopId: intermediateStops.stopId,
      arrivalTime: intermediateStops.arrivalTime,
      stopOrder: intermediateStops.stopOrder,
      rideLineName: rides.lineName,
      stopName: stops.name,
      stopCity: stops.city,
    })
    .from(intermediateStops)
    .leftJoin(rides, eq(intermediateStops.rideId, rides.id))
    .leftJoin(stops, eq(intermediateStops.stopId, stops.id))
    .where(eq(intermediateStops.stopId, stopId))
    .orderBy(intermediateStops.stopOrder);

  return result;
}

/**
 * Create a new intermediate stop
 */
export async function createIntermediateStop(input: IntermediateStopInput): Promise<IntermediateStopWithDetails> {
  const db = getDb();
  
  // Validate that the ride exists
  const rideExists = await db
    .select({ id: rides.id })
    .from(rides)
    .where(eq(rides.id, input.rideId))
    .limit(1);
  
  if (rideExists.length === 0) {
    throw new Error(`Ride with ID ${input.rideId} does not exist`);
  }
  
  // Validate that the stop exists
  const stopExists = await db
    .select({ id: stops.id })
    .from(stops)
    .where(eq(stops.id, input.stopId))
    .limit(1);
  
  if (stopExists.length === 0) {
    throw new Error(`Stop with ID ${input.stopId} does not exist`);
  }
  
  // Check for duplicate stop order in the same ride
  const existingOrder = await db
    .select({ id: intermediateStops.id })
    .from(intermediateStops)
    .where(and(
      eq(intermediateStops.rideId, input.rideId),
      eq(intermediateStops.stopOrder, input.stopOrder)
    ))
    .limit(1);
  
  if (existingOrder.length > 0) {
    throw new Error(`Stop order ${input.stopOrder} already exists for ride ${input.rideId}`);
  }
  
  // Insert the new intermediate stop
  await db.insert(intermediateStops).values({
    rideId: input.rideId,
    stopId: input.stopId,
    arrivalTime: input.arrivalTime,
    stopOrder: input.stopOrder,
  });
  
  // Get the created stop with details
  const created = await db
    .select({
      id: intermediateStops.id,
      rideId: intermediateStops.rideId,
      stopId: intermediateStops.stopId,
      arrivalTime: intermediateStops.arrivalTime,
      stopOrder: intermediateStops.stopOrder,
      rideLineName: rides.lineName,
      stopName: stops.name,
      stopCity: stops.city,
    })
    .from(intermediateStops)
    .leftJoin(rides, eq(intermediateStops.rideId, rides.id))
    .leftJoin(stops, eq(intermediateStops.stopId, stops.id))
    .where(eq(intermediateStops.rideId, input.rideId))
    .orderBy(intermediateStops.stopOrder)
    .limit(1);
  
  if (!created[0]) {
    throw new Error('Failed to retrieve created intermediate stop');
  }
  
  return created[0];
}

/**
 * Update an existing intermediate stop
 */
export async function updateIntermediateStop(
  id: number,
  update: Partial<Omit<IntermediateStopInput, 'rideId'>>
): Promise<IntermediateStopWithDetails | undefined> {
  const db = getDb();
  
  // Get existing intermediate stop
  const existing = await getIntermediateStopById(id);
  if (!existing) {
    return undefined;
  }
  
  // Validate stop exists if stopId is being updated
  if (update.stopId) {
    const stopExists = await db
      .select({ id: stops.id })
      .from(stops)
      .where(eq(stops.id, update.stopId))
      .limit(1);
    
    if (stopExists.length === 0) {
      throw new Error(`Stop with ID ${update.stopId} does not exist`);
    }
  }
  
  // Check for duplicate stop order if stopOrder is being updated
  if (update.stopOrder !== undefined && update.stopOrder !== existing.stopOrder) {
    const existingOrder = await db
      .select({ id: intermediateStops.id })
      .from(intermediateStops)
      .where(and(
        eq(intermediateStops.rideId, existing.rideId),
        eq(intermediateStops.stopOrder, update.stopOrder)
      ))
      .limit(1);
    
    if (existingOrder.length > 0) {
      throw new Error(`Stop order ${update.stopOrder} already exists for ride ${existing.rideId}`);
    }
  }
  
  // Update the intermediate stop
  await db
    .update(intermediateStops)
    .set({
      stopId: update.stopId ?? existing.stopId,
      arrivalTime: update.arrivalTime ?? existing.arrivalTime,
      stopOrder: update.stopOrder ?? existing.stopOrder,
    })
    .where(eq(intermediateStops.id, id));
  
  return await getIntermediateStopById(id);
}

/**
 * Delete an intermediate stop
 */
export async function deleteIntermediateStop(id: number): Promise<void> {
  const db = getDb();
  
  // Check if the intermediate stop exists
  const existing = await getIntermediateStopById(id);
  if (!existing) {
    throw new Error(`Intermediate stop with ID ${id} does not exist`);
  }
  
  await db.delete(intermediateStops).where(eq(intermediateStops.id, id));
}

/**
 * Delete all intermediate stops for a specific ride
 */
export async function deleteIntermediateStopsByRideId(rideId: string): Promise<void> {
  const db = getDb();
  
  await db.delete(intermediateStops).where(eq(intermediateStops.rideId, rideId));
}

/**
 * Reorder intermediate stops for a ride
 * This function updates the stopOrder for all intermediate stops in a ride
 */
export async function reorderIntermediateStopsForRide(
  rideId: string,
  newOrder: Array<{ id: number; stopOrder: number }>
): Promise<void> {
  const db = getDb();
  
  // Validate that all intermediate stops belong to the specified ride
  const existingStops = await db
    .select({ id: intermediateStops.id })
    .from(intermediateStops)
    .where(eq(intermediateStops.rideId, rideId));
  
  const existingIds = existingStops.map(s => s.id);
  const newOrderIds = newOrder.map(o => o.id);
  
  // Check if all IDs in newOrder exist in the ride
  const missingIds = newOrderIds.filter(id => !existingIds.includes(id));
  if (missingIds.length > 0) {
    throw new Error(`Intermediate stops with IDs ${missingIds.join(', ')} do not belong to ride ${rideId}`);
  }
  
  // Check if all existing IDs are in newOrder
  const extraIds = existingIds.filter(id => !newOrderIds.includes(id));
  if (extraIds.length > 0) {
    throw new Error(`Missing intermediate stops with IDs ${extraIds.join(', ')} in reorder request`);
  }
  
  // Update each intermediate stop's order
  for (const item of newOrder) {
    await db
      .update(intermediateStops)
      .set({ stopOrder: item.stopOrder })
      .where(eq(intermediateStops.id, item.id));
  }
}

/**
 * Get the next available stop order for a ride
 */
export async function getNextStopOrderForRide(rideId: string): Promise<number> {
  const db = getDb();
  
  const result = await db
    .select({ maxOrder: intermediateStops.stopOrder })
    .from(intermediateStops)
    .where(eq(intermediateStops.rideId, rideId))
    .orderBy(intermediateStops.stopOrder)
    .limit(1);
  
  return result.length > 0 ? (result[0].maxOrder || 0) + 1 : 1;
}
