import { prisma } from "@/utils/db";
import { Airline, AsyncApiResponse } from "@/utils/types";
import { withAuth } from "@/middlewares/auth";
import { NextResponse } from "next/server";

async function get(): AsyncApiResponse<Airline[]> {
    const airlines = await prisma.airline.findMany({
        select: {
            name: true,
            code: true,
            base: {
                select: {
                    name: true,
                    code: true,
                    city: true,
                    country: true,
                },
            },
        },
    });

    return NextResponse.json(airlines);
}

export const GET = withAuth(get);
