// This is a standalone code run by Node, not part of the Next.js app

const { PrismaClient } = require("@prisma/client");
const { agencies } = require("./agencies.js");
const crypto = require("crypto");

const prisma = new PrismaClient();

const getApiKey = (str) => {
  return crypto.createHash("sha256").update(str).digest("hex");
};

async function main() {
  // Insert each agency into the database
  for (const agency of agencies) {
    const exisitingAgency = await prisma.agency.findUnique({
      where: {
        name: agency,
      },
    });

    if (exisitingAgency) {
      console.log(`agency ${agency.code} already exists`);
      continue;
    }

    await prisma.agency.create({
      data: {
        name: agency,
        apiKey: getApiKey(agency),
        isActive: true,
      },
    });
  }

  console.log("agencies imported successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
