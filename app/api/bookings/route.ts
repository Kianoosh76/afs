import { prisma } from "@/utils/db";
import { AsyncApiResponse, Booking, RestfulNextRequest } from "@/utils/types";
import { Agency, BookingStatus, FlightStatus } from "@prisma/client";
import { transformBooking } from "./utils";
import { flightSelectFields } from "../flights/utils";
import { withAuth } from "@/middlewares/auth";
import { NextResponse } from "next/server";
import { restful } from "@/middlewares/restful";
import { validateStringFields } from "@/utils/query";

interface BookingRequest {
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  flightIds: string[];
}

async function post(
  request: RestfulNextRequest & { agency: Agency },
): AsyncApiResponse<Booking> {
  validateStringFields(request, [
    "firstName",
    "lastName",
    "email",
    "passportNumber",
  ]);
  const { flightIds, firstName, lastName, email, passportNumber } =
    request.data as BookingRequest;

  if (passportNumber.length < 9) {
    return NextResponse.json(
      { error: "Passport number must be 9 digits long" },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(flightIds) ||
    !flightIds.length ||
    flightIds.findIndex((id) => typeof id !== "string" || !id.length) !== -1
  ) {
    return NextResponse.json(
      {
        error: "Missing or invalid flight IDs",
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

export const POST = withAuth(restful(post));
