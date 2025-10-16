import { NextRequest, NextResponse } from "next/server";
import { listRides } from "@/app/lib/ridesStore";
import { listStops } from "@/app/lib/stopsStore";

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

    // Enrich rides with stop names
    const enrichedRides = matchingRides.map((ride) => {
      const originStopData = stops.find((s) => s.id === ride.originStopId);
      const destStopData = stops.find((s) => s.id === ride.destinationStopId);

      return {
        id: ride.id,
        lineName: ride.lineName,
        originStop: originStopData
          ? { id: originStopData.id, name: originStopData.name, city: originStopData.city }
          : null,
        destinationStop: destStopData
          ? { id: destStopData.id, name: destStopData.name, city: destStopData.city }
          : null,
        departureTime: ride.departureTime,
        arrivalTime: ride.arrivalTime,
        price: ride.price,
        intermediateStops: ride.intermediateStops || [],
      };
    });

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

