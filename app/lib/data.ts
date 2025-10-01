export type Stop = {
  id: string;
  name: string;
  city: string;
};

export type Departure = {
  id: string;
  lineName: string;
  originStopId: string;
  destinationStopId: string;
  departureTime: string; // HH:MM 24h
  arrivalTime: string; // HH:MM 24h
};

export type StopIdToStop = Record<string, Stop>;

export const stops: Stop[] = [
  { id: "s1", name: "Terminal Bus", city: "RIMINI" },
  { id: "s2", name: "Stazione FS", city: "Chieti" },
  { id: "s3", name: "Piazza Municipio", city: "Lanciano" },
  { id: "s4", name: "Ospedale", city: "Pescara" },
  { id: "s5", name: "Centro", city: "Ortona" },
];

export const departures: Departure[] = [
  //{ id: "d1", lineName: "L1", originStopId: "s1", destinationStopId: "s2", departureTime: "08:15", arrivalTime: "08:55" },
  { id: "d2", lineName: "L2", originStopId: "s4", destinationStopId: "s3", departureTime: "08:30", arrivalTime: "09:20" },
  { id: "d3", lineName: "L3", originStopId: "s2", destinationStopId: "s5", departureTime: "09:05", arrivalTime: "09:50" },
  { id: "d4", lineName: "L4", originStopId: "s3", destinationStopId: "s1", departureTime: "07:50", arrivalTime: "08:40" },
  { id: "d5", lineName: "L5", originStopId: "s5", destinationStopId: "s4", departureTime: "09:40", arrivalTime: "10:20" },
];

export const stopIdToStop: StopIdToStop = stops.reduce((acc, stop) => {
  acc[stop.id] = stop;
  return acc;
}, {} as StopIdToStop);

export function toMinutes(time: string): number {
  const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
  return hh * 60 + mm;
}

export function formatDuration(from: string, to: string): string {
  const minutes = toMinutes(to) - toMinutes(from);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} min`;
  return `${h} h ${m.toString().padStart(2, "0")} min`;
}


