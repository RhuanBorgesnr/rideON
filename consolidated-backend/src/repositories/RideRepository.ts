import { prisma } from '../prisma/client';
import { Ride } from '@prisma/client';

export class RideRepository {
  async createRide(data: {
    workDayId?: number | null;
    earning: number;
    distanceKm: number;
    durationMinutes: number;
    fuelCost?: number | null;
    feeCost?: number | null;
    maintenanceCost?: number | null;
    otherCost?: number | null;
  }): Promise<Ride> {
    const ride = await prisma.ride.create({
      data: {
        workDayId: data.workDayId ?? null,
        earning: data.earning,
        distanceKm: data.distanceKm,
        durationMinutes: data.durationMinutes,
        fuelCost: data.fuelCost ?? null,
        feeCost: data.feeCost ?? null,
        maintenanceCost: data.maintenanceCost ?? null,
        otherCost: data.otherCost ?? null
      }
    });
    return ride;
  }

  async listRides(): Promise<Ride[]> {
    return await prisma.ride.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
