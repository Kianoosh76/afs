const { PrismaClient } = require("@prisma/client");

export const prisma = new PrismaClient();

export function fields(...fields: string[]) {
  return fields.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {});
}
