export interface IWorkDayRepository {
  createWorkDay(startKm: number): Promise<any>;
  findOpenWorkDay(): Promise<any | null>;
  endWorkDay(workDayId: number, endKm: number, totalEarning: number): Promise<any | null>;
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
