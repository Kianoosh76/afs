import { prisma } from "@/utils/db";
import { AsyncApiResponse, Booking } from "@/utils/types";
import { Agency, BookingStatus, FlightStatus } from "@prisma/client";
import { transformBooking } from "./utils";
import { flightSelectFields } from "../flights/utils";
import { withAuth } from "@/middlewares/auth";
import { NextRequest, NextResponse } from "next/server";

interface BookingRequest {
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  flightIds: string[];
}

async function post(
  request: NextRequest & { agency: Agency },
): AsyncApiResponse<Booking> {
  const { flightIds, firstName, lastName, email, passportNumber } =
    (await request.json()) as BookingRequest;

  if (
    !flightIds?.length ||
    !firstName ||
    !lastName ||
    !email ||
    (passportNumber?.length ?? 0) < 9
  ) {
    return NextResponse.json(
      {
        error:
          "Flight IDs, firstName, lastName, email, and passportNumber (9 characters) are required",
      },
      { status: 400 },
    );
  }

  try {
    // Fetch flight details for all legs
    const flights = await prisma.flight.findMany({
      where: { id: { in: flightIds } },
      orderBy: { departureTime: "asc" }, // Ensure flights are in order by departure time
    });

    if (flights.length !== flightIds.length) {
      return NextResponse.json(
        {
          error: "One or more flights not found",
        },
        { status: 404 },
      );
    }

    // Check seat availability for each leg and verify they are in sequence
    for (let i = 0; i < flights.length; i++) {
      const flight = flights[i];

      // Check if the flight has available seats (only 1 seat is required)
      if (
        flight.status !== FlightStatus.SCHEDULED ||
        flight.availableSeats < 1
      ) {
        return NextResponse.json(
          {
            error: `No available seats on flight ${flight.id}`,
          },
          { status: 400 },
        );
      }

      // Ensure flights are consecutive in sequence (if more than one leg)
      if (i > 0 && flights[i - 1].arrivalTime >= flight.departureTime) {
        return NextResponse.json(
          {
            error: "Flights are not consecutive in sequence",
          },
          { status: 400 },
        );
      }
    }

    // Create the booking with passenger information and link flights
    const booking = await prisma.booking.create({
      data: {
        firstName,
        lastName,
        email,
        passportNumber,
        flights: {
          connect: flightIds.map((flightId) => ({ id: flightId })),
        },
        status: BookingStatus.CONFIRMED,
        agencyId: request.agency.id,
      },
      include: {
        flights: {
          select: flightSelectFields,
        },
      },
    });

    // Update available seats on each flight
    for (const flight of flights) {
      await prisma.flight.update({
        where: { id: flight.id },
        data: { availableSeats: { decrement: 1 } },
      });
    }

    return NextResponse.json(transformBooking(booking));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "An error occurred while processing your booking",
      },
      { status: 500 },
    );
  }
}

export const POST = withAuth(post);
