import { Booking, Flight } from "@/utils/types";
import { Booking as PrismaBooking } from "@prisma/client";

export const transformBooking = (
  booking: PrismaBooking & { flights: Flight[] },
): Booking => {
  const id = booking.id;
  delete booking.id;

  return {
    bookingReference: id.slice(0, 6).toUpperCase(), // First 6 characters of the id
    ticketNumber: id.slice(26), // Next 4 characters of the id
    ...booking,
  };
};
