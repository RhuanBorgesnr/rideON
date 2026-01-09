import { prisma } from '../lib/prisma';
import { WorkDay, Expense, Ride, WorkSegment } from '@prisma/client';

export class WorkDayRepository {
  async createDraft(data: { date: Date; startKm?: number; platforms?: string[] }): Promise<WorkDay> {
    const workDay = await prisma.workDay.create({
      data: {
        status: 'DRAFT',
        date: data.date,
        startKm: data.startKm,
        platforms: data.platforms ?? []
      }
    });
    return workDay;
  }

  async findDraftByDate(date: Date): Promise<WorkDay | null> {
    return prisma.workDay.findFirst({
      where: { status: 'DRAFT', date }
    });
  }

  async update(workDayId: number, data: { startTime?: Date; endTime?: Date; startKm?: number; endKm?: number; totalEarning?: number; platforms?: string[] }): Promise<WorkDay> {
    const updated = await prisma.workDay.update({
      where: { id: workDayId },
      data
    });
    return updated;
  }

  async close(workDayId: number): Promise<WorkDay | null> {
    const updatedWorkDay = await prisma.workDay.update({
      where: { id: workDayId },
      data: {
        status: 'CLOSED'
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
        orderBy: { date: 'desc' }
      });
    } catch {
      return [];
    }
  }
}
