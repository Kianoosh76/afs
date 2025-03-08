import { prisma } from "@/utils/db";
import { AsyncApiResponse, Flight } from "@/utils/types";
import { flightSelectFields } from "../utils";
import { withAuth } from "@/middlewares/auth";
import { NextRequest, NextResponse } from "next/server";

async function get(request: NextRequest, { params }): AsyncApiResponse<Flight> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        error: "Id is required",
      },
      { status: 400 },
    );
  }

  const flight = await prisma.flight.findUnique({
    where: {
      id,
    },
    select: flightSelectFields,
  });

  // Respond with direct and indirect flights
  return NextResponse.json(flight);
}

export const GET = withAuth(get);
