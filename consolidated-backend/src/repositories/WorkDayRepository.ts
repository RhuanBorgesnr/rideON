import { prisma } from '../lib/prisma';
import { WorkDay, Expense, Ride, WorkSegment } from '@prisma/client';

export class WorkDayRepository {
  async createWorkDay(startKm: number): Promise<WorkDay> {
    const workDay = await prisma.workDay.create({
      data: { startKm },
    });
    return workDay;
  }

  async findOpenWorkDay(): Promise<WorkDay | null> {
    return prisma.workDay.findFirst({
      where: { endTime: null },
      orderBy: { startTime: 'desc' }
    });
  }

  async endWorkDay(workDayId: number, endKm: number, totalEarning: number): Promise<WorkDay | null> {
    const updatedWorkDay = await prisma.workDay.update({
      where: { id: workDayId },
      data: {
        endKm,
        totalEarning,
        endTime: new Date()
      }
    });
    return updatedWorkDay;
  }

  async getWorkDayById(workDayId: number): Promise<(WorkDay & { expenses: Expense[]; rides: Ride[]; segments: WorkSegment[] }) | null> {
    return prisma.workDay.findUnique({
      where: { id: workDayId },
      include: { expenses: true, rides: true, segments: true }
    });
  }

  async listWorkDays(): Promise<(WorkDay & { expenses: Expense[] })[]> {
    try {
      return await prisma.workDay.findMany({
        include: { expenses: true },
        orderBy: { startTime: 'desc' }
      });
    } catch {
      return [];
    }
  }
}
