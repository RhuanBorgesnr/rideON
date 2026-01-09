export interface IWorkDayRepository {
  createDraft(data: { date: Date; startKm?: number; platforms?: string[] }): Promise<any>;
  findDraftByDate(date: Date): Promise<any | null>;
  update(workDayId: number, data: { startTime?: Date; endTime?: Date; startKm?: number; endKm?: number; totalEarning?: number; platforms?: string[] }): Promise<any>;
  close(workDayId: number): Promise<any>;
  getWorkDayById(workDayId: number): Promise<any | null>;
  listWorkDays(): Promise<any[]>;
}

export interface IExpenseRepository {
  createExpense(workDayId: number, type: string, amount: number, note?: string, occurredAt?: Date): Promise<any>;
}

export interface ISegmentRepository {
  createSegment(workDayId: number, origin: string, destination: string, distanceKm: number): Promise<any>;
}

export interface IGeneralExpenseRepository {
  create(type: string, amount: number, note?: string, occurredAt?: Date): Promise<any>;
}
