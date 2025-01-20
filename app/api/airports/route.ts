import { prisma } from "@/utils/db";
import { Airport, AsyncApiResponse } from "@/utils/types";
import { withAuth } from "@/middlewares/auth";
import { NextResponse } from "next/server";

async function get(): AsyncApiResponse<Airport[]> {
    const airports = await prisma.airport.findMany({
        select: {
            id: true,
            code: true,
            name: true,
            city: true,
            country: true,
        },
    });

    return NextResponse.json(airports);
}

export const GET = withAuth(get);
