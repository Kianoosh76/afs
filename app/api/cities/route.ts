import { prisma } from "@/utils/db";
import { AsyncApiResponse, City } from "@/utils/types";
import { withAuth } from "@/middlewares/auth";
import { NextResponse } from "next/server";

async function get(): AsyncApiResponse<City[]> {
    const cities = await prisma.airport.findMany({
        select: {
            city: true,
            country: true,
        },
        distinct: ["city", "country"],
    });

    return NextResponse.json(cities);
}

export const GET = withAuth(get);
