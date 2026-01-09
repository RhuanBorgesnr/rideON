-- CreateEnum
CREATE TYPE "WorkDayStatus" AS ENUM ('DRAFT', 'CLOSED');

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_workDayId_fkey";

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "note" TEXT,
ADD COLUMN     "occurredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "work_days" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "platforms" TEXT[],
ADD COLUMN     "status" "WorkDayStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "startKm" DROP NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "startTime" DROP DEFAULT;

-- CreateTable
CREATE TABLE "work_segments" (
    "id" SERIAL NOT NULL,
    "workDayId" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_expenses" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_segments_workDayId_idx" ON "work_segments"("workDayId");

-- CreateIndex
CREATE INDEX "general_expenses_createdAt_idx" ON "general_expenses"("createdAt");

-- CreateIndex
CREATE INDEX "expenses_workDayId_idx" ON "expenses"("workDayId");

-- CreateIndex
CREATE INDEX "rides_workDayId_idx" ON "rides"("workDayId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_workDayId_fkey" FOREIGN KEY ("workDayId") REFERENCES "work_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_segments" ADD CONSTRAINT "work_segments_workDayId_fkey" FOREIGN KEY ("workDayId") REFERENCES "work_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
