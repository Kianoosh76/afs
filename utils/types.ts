import { NextResponse } from "next/server";

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
