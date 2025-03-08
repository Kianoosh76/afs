import { prisma } from "@/utils/db";
import { AsyncApiResponse, Flight } from "@/utils/types";
import { flightSelectFields } from "./utils";
import { withAuth } from "@/middlewares/auth";
import { NextRequest, NextResponse } from "next/server";
import { getSearchParams } from "@/utils/query";
import { FlightStatus } from "@prisma/client";

interface FlightsRequest {
  origin?: string; // city or airport code
  destination?: string; // city or airport code
  date?: string; // Departure date -- format YYYY-MM-DD
}

interface FlightsResponse {
  results: {
    legs: number;
    flights: Flight[];
  }[];
}

async function get(request: NextRequest): AsyncApiResponse<FlightsResponse> {
  const { origin, destination, date } =
    getSearchParams<FlightsRequest>(request);

  if (!origin || !destination || !date) {
    return NextResponse.json(
      {
        error: "Origin, destination, and date are required parameters",
      },
      { status: 400 },
    );
  }

  if (origin === destination) {
    return NextResponse.json(
      {
        error: "Origin and destination cannot be the same",
      },
      { status: 400 },
    );
  }

  const searchDate = new Date(date as string);
  const nextDay = new Date(searchDate);
  const twoDaysLater = new Date(searchDate);
  nextDay.setDate(searchDate.getDate() + 1);
  twoDaysLater.setDate(searchDate.getDate() + 2);

  try {
    // Fetch origin airports
    const originAirports = await prisma.airport.findMany({
      where: {
        OR: [
          { city: { equals: origin as string, mode: "insensitive" } },
          { code: { equals: origin as string, mode: "insensitive" } },
        ],
      },
    });

    // Fetch destination airports
    const destinationAirports = await prisma.airport.findMany({
      where: {
        OR: [
          {
            city: {
              equals: destination as string,
              mode: "insensitive",
            },
          },
          {
            code: {
              equals: destination as string,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (originAirports.length === 0 || destinationAirports.length === 0) {
      return NextResponse.json(
        {
          error:
            "No airports found for the given origin or destination location",
        },
        { status: 400 },
      );
    }

    const originAirportIds = originAirports.map((airport) => airport.id);
    const destinationAirportIds = destinationAirports.map(
      (airport) => airport.id,
    );

    // Search for direct flights
    const directFlights = await prisma.flight.findMany({
      where: {
        departureTime: {
          gte: searchDate,
          lt: nextDay,
        },
        originId: { in: originAirportIds },
        destinationId: { in: destinationAirportIds },
        availableSeats: { gt: 0 },
        status: {
          in: [FlightStatus.SCHEDULED, FlightStatus.DELAYED],
        },
      },
      select: flightSelectFields,
    });

    // Search for indirect flights (two-leg flights with a layover)
    const indirectFlights = [];

    // For each origin airport, find flights with layovers
    for (const originAirportId of originAirportIds) {
      // Step 1: Find all first-leg flights departing from the origin on the given date
      const firstLegFlights = await prisma.flight.findMany({
        where: {
          departureTime: {
            gte: searchDate,
            lt: nextDay,
          },
          originId: originAirportId,
          destinationId: { notIn: destinationAirportIds }, // Ensure it doesn't go directly to the destination
          availableSeats: { gt: 0 },
          status: {
            in: [FlightStatus.SCHEDULED, FlightStatus.DELAYED],
          },
        },
        select: flightSelectFields,
      });

      // Step 2: For each first-leg flight, find a matching second-leg flight
      for (const firstLeg of firstLegFlights) {
        const layoverAirportId = firstLeg.destinationId;

        const secondLegFlights = await prisma.flight.findMany({
          where: {
            departureTime: {
              gte: new Date(firstLeg.arrivalTime.getTime() + 60 * 60 * 1000), // Minimum 1-hour layover
              lt: twoDaysLater,
            },
            originId: layoverAirportId,
            destinationId: { in: destinationAirportIds },
            availableSeats: { gt: 0 },
            status: {
              in: [FlightStatus.SCHEDULED, FlightStatus.DELAYED],
            },
          },
          select: flightSelectFields,
        });

        // Combine first and second leg flights to form an indirect flight
        for (const secondLeg of secondLegFlights) {
          indirectFlights.push({
            firstLeg,
            secondLeg,
          });
        }
      }
    }

    // Respond with direct and indirect flights
    return NextResponse.json({
      results: [
        ...directFlights.map((flight) => ({ legs: 1, flights: [flight] })),
        ...indirectFlights.map((flight) => ({
          legs: 2,
          flights: [flight.firstLeg, flight.secondLeg],
        })),
      ],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "An error occurred while searching for flights",
      },
      { status: 500 },
    );
  }
}

export const GET = withAuth(get);
