-- CreateTable
CREATE TABLE "rides" (
    "id" SERIAL NOT NULL,
    "workDayId" INTEGER,
    "earning" DOUBLE PRECISION NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "fuelCost" DOUBLE PRECISION,
    "feeCost" DOUBLE PRECISION,
    "maintenanceCost" DOUBLE PRECISION,
    "otherCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rides_createdAt_idx" ON "rides"("createdAt");

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_workDayId_fkey" FOREIGN KEY ("workDayId") REFERENCES "work_days"("id") ON DELETE SET NULL ON UPDATE CASCADE;
