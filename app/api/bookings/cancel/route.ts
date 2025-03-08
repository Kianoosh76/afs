import { prisma } from "@/utils/db";
import { AsyncApiResponse, Booking, RestfulNextRequest } from "@/utils/types";
import { transformBooking } from "../utils";
import { Agency, BookingStatus } from "@prisma/client";
import { withAuth } from "@/middlewares/auth";
import { NextResponse } from "next/server";
import { flightSelectFields } from "../../flights/utils";
import { restful } from "@/middlewares/restful";
import { validateStringFields } from "@/utils/query";

interface CancelRequest {
  lastName: string;
  bookingReference: string;
}

async function post(
  request: RestfulNextRequest & { agency: Agency },
): AsyncApiResponse<Booking> {
  validateStringFields(request, ["lastName", "bookingReference"]);
  const { lastName, bookingReference } = request.data as CancelRequest;

  const booking = await prisma.booking.findFirst({
    where: {
      lastName: {
        equals: lastName,
        mode: "insensitive",
      },
      id: {
        startsWith: bookingReference.toLowerCase(),
      },
      agencyId: request.agency.id,
      status: BookingStatus.CONFIRMED,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BookingStatus.CANCELLED },
    include: {
      flights: {
        select: flightSelectFields,
      },
    },
  });

  // Update available seats on each flight
  for (const flight of updatedBooking.flights) {
    await prisma.flight.update({
      where: { id: flight.id },
      data: { availableSeats: { increment: 1 } },
    });
  }

  return NextResponse.json(transformBooking(updatedBooking));
}

export const POST = withAuth(restful(post));
