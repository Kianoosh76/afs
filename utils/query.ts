import { NextRequest } from "next/server";

export function getSearchParams<T>(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries()) as T;
}
