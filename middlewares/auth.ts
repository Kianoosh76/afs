import { prisma } from "@/utils/db";
import { Agency } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type Handler = (req: NextRequest) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: Handler): Handler {
  return async (request: NextRequest & { agency?: Agency }) => {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey?.length) {
      return NextResponse.json(
        { error: "No API key found in request" },
        { status: 401 },
      );
    }

    const agency = await prisma.agency.findUnique({
      where: {
        apiKey,
        isActive: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
    }

    request.agency = agency; // Attach agency to request object
    return handler(request);
  };
}
