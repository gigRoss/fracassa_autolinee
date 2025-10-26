import { getDb } from "./db";
import { rides as ridesTable, intermediateStops as intermediateTable } from "./schema";
import { and, eq, inArray } from "drizzle-orm";
import { nowInItaly } from "./dateUtils";

export type RideWithStops = {
  id: string;
  lineName: string;
  originStopId: string;
  destinationStopId: string;
  departureTime: string;
  arrivalTime: string;
  price?: string; // importo della corsa (es. "2.50")
  intermediateStops?: Array<{ stopId: string; time: string }>;
  archived?: boolean;
};

/**
 * List rides from the database (all, including archived flag)
 */
export async function listRides(): Promise<RideWithStops[]> {
  const db = getDb();
  const base = await db.select().from(ridesTable);
  if (base.length === 0) return [];

  const rideIds = base.map((r) => r.id);
  const intermediates = await db
    .select()
    .from(intermediateTable)
    .where(inArray(intermediateTable.rideId, rideIds));

  const rideIdToIntermediates: Record<string, Array<{ stopId: string; time: string; stopOrder: number }>> = {};
  for (const s of intermediates) {
    if (!rideIdToIntermediates[s.rideId]) rideIdToIntermediates[s.rideId] = [];
    rideIdToIntermediates[s.rideId].push({ stopId: s.stopId, time: s.arrivalTime, stopOrder: s.stopOrder });
  }

  return base.map((r) => {
    const allStops = rideIdToIntermediates[r.id] || [];
    const sortedStops = [...allStops].sort((a, b) => a.stopOrder - b.stopOrder);
    const maxOrder = Math.max(...sortedStops.map(s => s.stopOrder), 0);
    const trueIntermediates = sortedStops
      .filter(s => s.stopOrder > 0 && s.stopOrder < maxOrder)
      .map(({ stopId, time }) => ({ stopId, time }));
    
    return {
      id: r.id,
      lineName: r.lineName,
      originStopId: r.originStopId,
      destinationStopId: r.destinationStopId,
      departureTime: r.departureTime,
      arrivalTime: r.arrivalTime,
      price: r.price ?? undefined,
      archived: r.archived ?? false,
      intermediateStops: trueIntermediates,
    };
  });
}

/**
 * Create a ride and optional intermediate stops
 */
export async function createRide(ride: Omit<RideWithStops, "id">): Promise<RideWithStops> {
  const db = getDb();
  const id = `d${Date.now()}`;

  await db.insert(ridesTable).values({
    id,
    lineName: ride.lineName,
    originStopId: ride.originStopId,
    destinationStopId: ride.destinationStopId,
    departureTime: ride.departureTime,
    arrivalTime: ride.arrivalTime,
    price: ride.price ?? null,
    archived: ride.archived ?? false,
    createdAt: nowInItaly(),
    updatedAt: nowInItaly(),
  });

  // Insert origin stop as first stop (order 0)
  await db.insert(intermediateTable).values({
    rideId: id,
    stopId: ride.originStopId,
    arrivalTime: ride.departureTime,
    stopOrder: 0,
  });

  // Insert intermediate stops
  const inter = ride.intermediateStops || [];
  let order = 1;
  for (const s of inter) {
    if (!s.stopId || !s.time) continue;
    await db.insert(intermediateTable).values({
      rideId: id,
      stopId: s.stopId,
      arrivalTime: s.time,
      stopOrder: order++,
    });
  }

  // Insert destination stop as last stop
  await db.insert(intermediateTable).values({
    rideId: id,
    stopId: ride.destinationStopId,
    arrivalTime: ride.arrivalTime,
    stopOrder: order,
  });

  return { id, ...ride };
}

/**
 * Get a single ride by id, including intermediate stops
 */
export async function getRideById(rideId: string): Promise<RideWithStops | undefined> {
  const db = getDb();
  const rows = await db.select().from(ridesTable).where(eq(ridesTable.id, rideId));
  const r = rows[0];
  if (!r) return undefined;
  const inter = await db
    .select()
    .from(intermediateTable)
    .where(eq(intermediateTable.rideId, rideId));
  
  // Filter out origin (stopOrder 0) and destination (last stopOrder) from intermediate stops
  const sorted = inter.sort((a, b) => a.stopOrder - b.stopOrder);
  const maxOrder = Math.max(...sorted.map(s => s.stopOrder), 0);
  const trueIntermediates = sorted.filter(s => s.stopOrder > 0 && s.stopOrder < maxOrder);
  
  return {
    id: r.id,
    lineName: r.lineName,
    originStopId: r.originStopId,
    destinationStopId: r.destinationStopId,
    departureTime: r.departureTime,
    arrivalTime: r.arrivalTime,
    price: r.price ?? undefined,
    archived: r.archived ?? false,
    intermediateStops: trueIntermediates.map((s) => ({ stopId: s.stopId, time: s.arrivalTime })),
  };
}

/**
 * Update ride fields; if intermediateStops is provided, replaces them
 */
export async function updateRide(
  rideId: string,
  update: Partial<Omit<RideWithStops, "id">>
): Promise<RideWithStops | undefined> {
  const db = getDb();
  const existing = await getRideById(rideId);
  if (!existing) return undefined;

  // Update main ride
  await db
    .update(ridesTable)
    .set({
      lineName: update.lineName ?? existing.lineName,
      originStopId: update.originStopId ?? existing.originStopId,
      destinationStopId: update.destinationStopId ?? existing.destinationStopId,
      departureTime: update.departureTime ?? existing.departureTime,
      arrivalTime: update.arrivalTime ?? existing.arrivalTime,
      price: update.price !== undefined ? update.price : existing.price,
      archived: update.archived ?? existing.archived ?? false,
      updatedAt: nowInItaly(),
    })
    .where(eq(ridesTable.id, rideId));

  // Replace intermediate stops if provided
  if (update.intermediateStops) {
    await db.delete(intermediateTable).where(eq(intermediateTable.rideId, rideId));
    
    // Insert origin stop as first stop (order 0)
    await db.insert(intermediateTable).values({
      rideId,
      stopId: update.originStopId ?? existing.originStopId,
      arrivalTime: update.departureTime ?? existing.departureTime,
      stopOrder: 0,
    });
    
    // Insert intermediate stops
    let order = 1;
    for (const s of update.intermediateStops) {
      if (!s.stopId || !s.time) continue;
      await db.insert(intermediateTable).values({
        rideId,
        stopId: s.stopId,
        arrivalTime: s.time,
        stopOrder: order++,
      });
    }
    
    // Insert destination stop as last stop
    await db.insert(intermediateTable).values({
      rideId,
      stopId: update.destinationStopId ?? existing.destinationStopId,
      arrivalTime: update.arrivalTime ?? existing.arrivalTime,
      stopOrder: order,
    });
  }

  return (await getRideById(rideId))!;
}

