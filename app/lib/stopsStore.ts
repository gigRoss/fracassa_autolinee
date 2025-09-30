import { Stop, stops as initialStops } from "@/app/lib/data";

let stopsStore: Stop[] = [];

export function seedStops() {
  if (stopsStore.length === 0) {
    stopsStore = [...initialStops];
  }
}

export function listStops(): Stop[] {
  return [...stopsStore];
}

export function getStopById(id: string): Stop | undefined {
  return stopsStore.find((s) => s.id === id);
}

export function createStop(stop: Omit<Stop, "id">): Stop {
  const id = `s${Date.now()}`;
  const newStop: Stop = { id, ...stop };
  stopsStore.push(newStop);
  return newStop;
}


