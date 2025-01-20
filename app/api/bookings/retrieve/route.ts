import { prisma } from "@/utils/db";
import { AsyncApiResponse, Booking } from "@/utils/types";
import { transformBooking } from "../utils";
import { flightSelectFields } from "../../flights/utils";
import { withAuth } from "@/middlewares/auth";
import { NextRequest, NextResponse } from "next/server";
import { getSearchParams } from "@/utils/query";

interface RetrieveRequest {
  lastName: string;
  bookingReference: string;
}

async function get(request: NextRequest): AsyncApiResponse<Booking> {
  const { lastName, bookingReference } =
    getSearchParams<RetrieveRequest>(request);

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
    },
    include: {
      flights: {
        select: flightSelectFields,
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(transformBooking(booking));
}

export const GET = withAuth(get);
