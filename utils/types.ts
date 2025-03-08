import { NextRequest, NextResponse } from "next/server";

// Api handler type for use in middlewares
export type ApiHandler = (
  req: NextRequest,
  args: { params: Promise<any> },
) => Promise<NextResponse> | NextResponse;

// Request object with parsed JSON body
export type RestfulNextRequest = NextRequest & {
  data: any;
};

// Response object with a posible error message
export type AsyncApiResponse<T> = Promise<NextResponse<T | { error: string }>>;

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface City {
  name: string;
  country: string;
}

export interface Airline {
  name: string;
  code: string;
  base: {
    city: string;
    country: string;
  };
}

export interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: number;
  originId: string;
  destinationId: string;
  airline: {
    name: string;
    code: string;
  };
  origin: {
    name: string;
    code: string;
    city: string;
    country: string;
  };
  destination: {
    name: string;
    code: string;
    city: string;
    country: string;
  };
}

export interface Booking {
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  bookingReference: string;
  ticketNumber: string;
  agencyId: string;
  flights: Flight[];
}
