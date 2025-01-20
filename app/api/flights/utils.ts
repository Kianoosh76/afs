import { fields } from "@/utils/db";

export const flightSelectFields = {
  ...fields(
    ...[
      ...[
        "id",
        "flightNumber",
        "departureTime",
        "arrivalTime",
        "originId",
        "destinationId",
      ],
      ...["duration", "price", "currency", "availableSeats", "status"],
    ],
  ),
  airline: {
    select: fields("code", "name"),
  },
  origin: {
    select: fields("code", "name", "city", "country"),
  },
  destination: {
    select: fields("code", "name", "city", "country"),
  },
};
