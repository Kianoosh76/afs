import { prisma } from "@/utils/db";
import { AsyncApiResponse, Booking } from "@/utils/types";
import { transformBooking } from "../utils";
import { Agency, BookingStatus } from "@prisma/client";
import { withAuth } from "@/middlewares/auth";
import { NextRequest, NextResponse } from "next/server";
import { flightSelectFields } from "../../flights/utils";

interface CancelRequest {
  lastName: string;
  bookingReference: string;
}

async function post(
  request: NextRequest & { agency: Agency },
): AsyncApiResponse<Booking> {
  const { lastName, bookingReference } =
    (await request.json()) as CancelRequest;

  if (!lastName || !bookingReference) {
    return NextResponse.json(
      { error: "Missing lastName or bookingReference" },
      { status: 400 },
    );
  }

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

export const POST = withAuth(post);

