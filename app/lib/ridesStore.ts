import { Departure } from "./data";

export type RideWithStops = Departure & {
  intermediateStops?: Array<{ stopId: string; time: string }>;
  archived?: boolean;
};

let rides: RideWithStops[] = [];

export function listRides(): RideWithStops[] {
  return rides.filter((r) => !r.archived);
}

export function createRide(ride: Omit<RideWithStops, "id">): RideWithStops {
  const id = `d${Date.now()}`;
  const newRide: RideWithStops = { id, ...ride };
  rides.push(newRide);
  return newRide;
}

export function seedRides(initial: RideWithStops[]) {
  if (rides.length === 0) {
    rides = [...initial];
  }
}

export function getRideById(rideId: string): RideWithStops | undefined {
  return rides.find((r) => r.id === rideId);
}

export function updateRide(
  rideId: string,
  update: Partial<Omit<RideWithStops, "id">>
): RideWithStops | undefined {
  const idx = rides.findIndex((r) => r.id === rideId);
  if (idx === -1) return undefined;
  const current = rides[idx];
  const updated: RideWithStops = {
    ...current,
    ...update,
  };
  rides[idx] = updated;
  return updated;
}


