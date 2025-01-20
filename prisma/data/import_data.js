// This is a standalone code run by Node, not part of the Next.js app

const { PrismaClient } = require("@prisma/client");
const { airports } = require("./airports.js");
const { airlines } = require("./airlines.js");

const prisma = new PrismaClient();

async function main() {
  // Insert each airport into the database
  for (const airport of airports) {
    const exisitingAirport = await prisma.airport.findUnique({
      where: {
        code: airport.code,
      },
    });

    if (exisitingAirport) {
      console.log(`Airport ${airport.code} already exists`);
      continue;
    }

    await prisma.airport.create({
      data: {
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
      },
    });
  }

  console.log("Airports imported successfully");

  for (const airline of airlines) {
    // Find the airport ID using the baseCode
    const baseAirport = await prisma.airport.findUnique({
      where: { code: airline.baseCode },
    });

    if (!baseAirport) {
      console.error(
        `Base airport with code ${airline.baseCode} not found for airline ${airline.name}`,
      );
      continue; // Skip this airline if the base airport is not found
    }

    const existingAirline = await prisma.airline.findUnique({
      where: { code: airline.code },
    });

    if (existingAirline) {
      console.log(`Airline ${airline.name} already exists`);
      continue; // Skip this airline if it already exists
    }

    // Insert the airline with the found base ID
    await prisma.airline.create({
      data: {
        name: airline.name,
        code: airline.code,
        country: airline.country,
        baseId: baseAirport.id, // Use the looked-up ID for the base airport
      },
    });
  }

  console.log("Airlines imported successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
