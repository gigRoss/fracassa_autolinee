import { NextRequest, NextResponse } from "next/server";
import { listRides } from "@/app/lib/ridesStore";
import { listStops } from "@/app/lib/stopsStore";
import { getIntermediateStopsByRideId } from "@/app/lib/intermediateStopsStore";

/**
 * Search API endpoint
 * Query params:
 * - origin: origin stop ID or name
 * - destination: destination stop ID or name
 * - date: (optional) date in YYYY-MM-DD format
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Missing required parameters: origin and destination" },
        { status: 400 }
      );
    }

    // Get all rides and stops
    const [rides, stops] = await Promise.all([listRides(), listStops()]);

    // Filter only visible (non-archived) rides
    const visibleRides = rides.filter((r) => !r.archived);

    // Helper function to find stop by name or ID
    const findStop = (query: string) => {
      return stops.find(
        (s) =>
          s.id.toLowerCase() === query.toLowerCase() ||
          s.name.toLowerCase() === query.toLowerCase()
      );
    };

    const originStop = findStop(origin);
    const destinationStop = findStop(destination);

    if (!originStop || !destinationStop) {
      return NextResponse.json(
        {
          error: "Stop not found",
          origin: originStop ? originStop.name : "Not found",
          destination: destinationStop ? destinationStop.name : "Not found",
        },
        { status: 404 }
      );
    }

    // Filter rides that match the route
    const matchingRides = visibleRides.filter((ride) => {
      // Direct match: origin -> destination
      if (
        ride.originStopId === originStop.id &&
        ride.destinationStopId === destinationStop.id
      ) {
        return true;
      }

      // Check if route passes through both stops in correct order
      const allStops = [
        { stopId: ride.originStopId, time: ride.departureTime },
        ...(ride.intermediateStops || []),
        { stopId: ride.destinationStopId, time: ride.arrivalTime },
      ];

      const originIndex = allStops.findIndex((s) => s.stopId === originStop.id);
      const destIndex = allStops.findIndex((s) => s.stopId === destinationStop.id);

      // Both stops must exist and origin must come before destination
      return originIndex !== -1 && destIndex !== -1 && originIndex < destIndex;
    });

    // Enrich rides with stop names and filter intermediate stops for the specific route
    const enrichedRides = await Promise.all(matchingRides.map(async (ride) => {
      const originStopData = stops.find((s) => s.id === ride.originStopId);
      const destStopData = stops.find((s) => s.id === ride.destinationStopId);

      // Get intermediate stops from the store for better data consistency
      let intermediateStopsFromStore = [];
      try {
        intermediateStopsFromStore = await getIntermediateStopsByRideId(ride.id);
      } catch (error) {
        console.error(`Error fetching intermediate stops for ride ${ride.id}:`, error);
        // Fallback to the data from ridesStore
        intermediateStopsFromStore = (ride.intermediateStops || []).map(stop => ({
          stopId: stop.stopId,
          arrivalTime: stop.time,
          stopName: stops.find(s => s.id === stop.stopId)?.name || `Stop ${stop.stopId}`,
          stopCity: stops.find(s => s.id === stop.stopId)?.city || null,
        }));
      }

      // Get all stops in order for this ride using store data
      const allStops = [
        { stopId: ride.originStopId, time: ride.departureTime },
        ...intermediateStopsFromStore.map(stop => ({ stopId: stop.stopId, time: stop.arrivalTime })),
        { stopId: ride.destinationStopId, time: ride.arrivalTime },
      ];

      // Find the indices of origin and destination stops
      const originIndex = allStops.findIndex((s) => s.stopId === originStop.id);
      const destIndex = allStops.findIndex((s) => s.stopId === destinationStop.id);

      // Filter intermediate stops to only include those between origin and destination
      const relevantIntermediateStops = intermediateStopsFromStore
        .filter(stop => {
          const stopIndex = allStops.findIndex(s => s.stopId === stop.stopId);
          return stopIndex > originIndex && stopIndex < destIndex;
        })
        .map((intermediateStop) => ({
          stopId: intermediateStop.stopId,
          time: intermediateStop.arrivalTime,
          stopName: intermediateStop.stopName || `Stop ${intermediateStop.stopId}`,
          city: intermediateStop.stopCity || null,
        }));

      // Get the specific departure and arrival times for this route segment
      const routeDepartureTime = allStops[originIndex].time;
      const routeArrivalTime = allStops[destIndex].time;

      return {
        id: ride.id,
        lineName: ride.lineName,
        originStopId: ride.originStopId,
        destinationStopId: ride.destinationStopId,
        originStop: originStopData
          ? { id: originStopData.id, name: originStopData.name, city: originStopData.city }
          : null,
        destinationStop: destStopData
          ? { id: destStopData.id, name: destStopData.name, city: destStopData.city }
          : null,
        departureTime: routeDepartureTime,
        arrivalTime: routeArrivalTime,
        price: ride.price,
        intermediateStops: relevantIntermediateStops,
      };
    }));

    return NextResponse.json({
      results: enrichedRides,
      count: enrichedRides.length,
      query: {
        origin: originStop.name,
        destination: destinationStop.name,
        date,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

