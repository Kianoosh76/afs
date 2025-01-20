-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookingFlights" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookingFlights_AB_unique" ON "_BookingFlights"("A", "B");

-- CreateIndex
CREATE INDEX "_BookingFlights_B_index" ON "_BookingFlights"("B");

-- AddForeignKey
ALTER TABLE "_BookingFlights" ADD CONSTRAINT "_BookingFlights_A_fkey" FOREIGN KEY ("A") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingFlights" ADD CONSTRAINT "_BookingFlights_B_fkey" FOREIGN KEY ("B") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;
