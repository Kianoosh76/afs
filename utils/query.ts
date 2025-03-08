import { NextRequest } from "next/server";
import { RestfulNextRequest } from "./types";
import { ValidationError } from "./error";

// Get search parameters from the query string
export function getSearchParams<T>(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries()) as T;
}

// Validates that the request body contains the expected string fields
export function validateStringFields(
  request: RestfulNextRequest,
  fields: string[],
): { error?: string } {
  for (const field of fields) {
    if (
      typeof request.data[field] !== "string" ||
      !request.data[field].length
    ) {
      throw new ValidationError(`Missing or invalid ${field}`);
    }
  }
  return {};
}
