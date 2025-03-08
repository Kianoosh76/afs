import { prisma } from "@/utils/db";
import { ApiHandler } from "@/utils/types";
import { Agency } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export function withAuth(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest & { agency?: Agency }, args) => {
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
    return handler(request, args);
  };
}
