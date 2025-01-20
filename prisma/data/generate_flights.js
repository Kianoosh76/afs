const { PrismaClient, FlightStatus } = require("@prisma/client");
const { sampleSize, random } = require("lodash");

const prisma = new PrismaClient();

async function main() {
  // Set the date range for the next 3 months
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(today.getMonth() + 3);

  // Fetch all airlines and airports
  const airlines = await prisma.airline.findMany({
    include: { base: true },
  });
  const allAirports = await prisma.airport.findMany();

  // Generate flights for each day in the specified date range
  for (
    let date = new Date(today);
    date <= threeMonthsLater;
    date.setDate(date.getDate() + 1)
  ) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const flightsToCreate = [];

    // Check if flights already exist on this date and continue if they do
    const existingFlights = await prisma.flight.findMany({
      where: {
        departureTime: {
          gte: new Date(year, month, day, 0, 0, 0),
          lt: new Date(year, month, day, 23, 59, 59),
        },
      },
    });

    if (existingFlights.length > 0) {
      console.log(`Flights already exist for ${date.toDateString()}`);
      continue;
    }

    // Loop through each airline
    for (const airline of airlines) {
      const baseAirport = airline.base;

      // Select 20% of available airports (excluding the base airport)
      const destinationAirports = sampleSize(
        allAirports.filter((airport) => airport.id !== baseAirport.id),
        Math.floor(allAirports.length * 0.2),
      );

      // Generate flights for each destination airport
      for (const destination of destinationAirports) {
        // Iterate through each day in the next 3 months

        // Set a sensible duration (in minutes) based on domestic or international flight
        let duration =
          destination.country === baseAirport.country
            ? random(60, 180) // Domestic
            : random(300, 900); // International

        duration += 5 - (duration % 5); // Round up to the nearest 5 minutes

        // Set departure and arrival times
        const departureTime = new Date(year, month, day, 0, 0, 0);
        departureTime.setMinutes(random(0, 11 * 24) * 5); // Randomize the departure time within the day

        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(departureTime.getMinutes() + duration);

        // Generate random flight details
        flightsToCreate.push({
          flightNumber: `${airline.code}${random(10, 9999)}`, // Random flight number
          departureTime,
          arrivalTime,
          duration,
          price: Math.round(random(300, 2000, true), 2), // Price between $300 and $2000
          currency: "CAD",
          availableSeats: random(50, 300), // Available seats between 50 and 300
          status: FlightStatus.SCHEDULED,
          airlineId: airline.id,
          originId: baseAirport.id,
          destinationId: destination.id,
        });
      }
    }

    await prisma.flight.createMany({
      data: flightsToCreate,
    });

    console.log(`Generated flights on ${date.toDateString()}`);
  }

  console.log("Daily flights generated for the next 3 months successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
