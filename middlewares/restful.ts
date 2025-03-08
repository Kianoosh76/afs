import { ValidationError } from "@/utils/error";
import { ApiHandler } from "@/utils/types";
import { NextRequest, NextResponse } from "next/server";

export function restful(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest & { data?: any }, args) => {
    try {
      const data = await request.json();

      request.data = data; // Attach parsed data to the request object
      return await handler(request, args);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: "Requst body is not a valid JSON string" },
          { status: 400 },
        );
      }

      console.log(error);
      return NextResponse.json(
        {
          error: "An unexpected error occurred",
        },
        { status: 500 },
      );
    }
  };
}
