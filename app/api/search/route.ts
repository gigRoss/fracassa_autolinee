import { NextRequest, NextResponse } from "next/server";
import { listRides } from "@/app/lib/ridesStore";
import { listStops } from "@/app/lib/stopsStore";
import { getIntermediateStopsByRideId, searchRidesBetweenStops } from "@/app/lib/intermediateStopsStore";

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
    const useIntermediateSearch = searchParams.get("useIntermediate") === "true";

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

    // Use the new SQL-based intermediate stops search if requested
    if (useIntermediateSearch) {
      const searchResults = await searchRidesBetweenStops(
        originStop.id,
        destinationStop.id
      );

      // Filter for non-archived rides
      const visibleRideIds = new Set(visibleRides.map(r => r.id));
      const filteredResults = searchResults.filter(r => visibleRideIds.has(r.rideId));

      // Get full ride details for enriched response
      const enrichedRides = await Promise.all(filteredResults.map(async (searchResult) => {
        const ride = rides.find(r => r.id === searchResult.rideId);
        if (!ride) return null;

        const originStopData = stops.find((s) => s.id === ride.originStopId);
        const destStopData = stops.find((s) => s.id === ride.destinationStopId);

        // Get ALL intermediate stops for this ride
        const allIntermediateStops = await getIntermediateStopsByRideId(ride.id);
        
        // Find the origin and destination positions in the stop order
        const originStopOrder = allIntermediateStops.findIndex(s => s.stopId === originStop.id);
        const destStopOrder = allIntermediateStops.findIndex(s => s.stopId === destinationStop.id);
        
        // Get intermediate stops between origin and destination
        const relevantIntermediateStops = allIntermediateStops
          .filter(s => {
            const stopIndex = allIntermediateStops.findIndex(interStop => interStop.id === s.id);
            return stopIndex > originStopOrder && stopIndex < destStopOrder;
          })
          .map(s => ({
            stopId: s.stopId,
            stopName: s.stopName,
            city: s.stopCity,
            time: s.arrivalTime
          }));

        // Return the searched origin and destination, not the ride's origin/destination
        const searchedOriginStopData = stops.find((s) => s.id === originStop.id);
        const searchedDestStopData = stops.find((s) => s.id === destinationStop.id);

        const formatPrice = (cents?: number, currency?: string) => {
          if (typeof cents !== 'number' || !isFinite(cents)) return undefined;
          if ((currency || 'EUR').toUpperCase() === 'EUR') {
            return `€${(cents / 100).toFixed(2).replace('.', ',')}`;
          }
          return `${(cents / 100).toFixed(2)} ${currency || ''}`.trim();
        };

        return {
          id: ride.id,
          lineName: ride.lineName,
          originStopId: originStop.id, // Use searched origin, not ride's origin
          destinationStopId: destinationStop.id, // Use searched destination, not ride's destination
          originStop: searchedOriginStopData
            ? { id: searchedOriginStopData.id, name: searchedOriginStopData.name, city: searchedOriginStopData.city }
            : null,
          destinationStop: searchedDestStopData
            ? { id: searchedDestStopData.id, name: searchedDestStopData.name, city: searchedDestStopData.city }
            : null,
          departureTime: searchResult.departureTime,
          arrivalTime: searchResult.arrivalTime,
          duration: searchResult.duration,
          price: formatPrice(searchResult.priceCents, searchResult.currency),
          intermediateStops: relevantIntermediateStops,
        };
      }));

      const validResults = enrichedRides.filter(r => r !== null);

      return NextResponse.json({
        results: validResults,
        count: validResults.length,
        query: {
          origin: originStop.name,
          destination: destinationStop.name,
          date,
        },
        method: "intermediateStops",
      });
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

    // Enrich rides with stop names - no intermediate stops shown
    const enrichedRides = await Promise.all(matchingRides.map(async (ride) => {
      // Don't show any intermediate stops - only show origin and destination
      const relevantIntermediateStops: any[] = [];

      // Use the ride's departure and arrival times
      const routeDepartureTime = ride.departureTime;
      const routeArrivalTime = ride.arrivalTime;

      // Return the searched origin and destination, not the ride's origin/destination
      const searchedOriginStopData = stops.find((s) => s.id === originStop.id);
      const searchedDestStopData = stops.find((s) => s.id === destinationStop.id);

      return {
        id: ride.id,
        lineName: ride.lineName,
        originStopId: originStop.id, // Use searched origin, not ride's origin
        destinationStopId: destinationStop.id, // Use searched destination, not ride's destination
        originStop: searchedOriginStopData
          ? { id: searchedOriginStopData.id, name: searchedOriginStopData.name, city: searchedOriginStopData.city }
          : null,
        destinationStop: searchedDestStopData
          ? { id: searchedDestStopData.id, name: searchedDestStopData.name, city: searchedDestStopData.city }
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

