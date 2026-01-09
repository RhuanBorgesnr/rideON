import { prisma } from '../lib/prisma';
import { WorkSegment } from '@prisma/client';

export class SegmentRepository {
  async createSegment(workDayId: number, origin: string, destination: string, distanceKm: number): Promise<WorkSegment> {
    const segment = await prisma.workSegment.create({
      data: {
        workDayId,
        origin,
        destination,
        distanceKm
      }
    });
    return segment;
  }
}
