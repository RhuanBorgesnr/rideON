import { WorkDayRepository } from '../repositories/WorkDayRepository';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { SegmentRepository } from '../repositories/SegmentRepository';
import { GeneralExpenseRepository } from '../repositories/GeneralExpenseRepository';
import { WorkDayMachine, WorkDayState } from '../domain/workday/WorkDayMachine';
import { IWorkDayRepository, IExpenseRepository, ISegmentRepository, IGeneralExpenseRepository } from '../application/ports/workday';

export interface DashboardData {
  id: number;
  startTime: Date;
  endTime: Date | null;
  hoursWorked: number | null;
  kmTravelled: number | null;
  totalEarning: number | null;
  totalExpenses: number;
  netProfit: number | null;
}

export interface DashboardSummary {
  todayProfit: number;
  history: { id: number; date: string; netProfit: number }[];
}

export class WorkDayService {
  private workDayRepository: IWorkDayRepository;
  private expenseRepository: IExpenseRepository;
  private segmentRepository: ISegmentRepository;
  private generalExpenseRepository: IGeneralExpenseRepository;

  constructor() {
    this.workDayRepository = new WorkDayRepository();
    this.expenseRepository = new ExpenseRepository();
    this.segmentRepository = new SegmentRepository();
    this.generalExpenseRepository = new GeneralExpenseRepository();
  }

  private isFinalizeWorkdayAction(
    action: { kind: string }
  ): action is { kind: 'FINALIZE_WORKDAY'; endKm: number; totalEarning: number; endTime: Date } {
    return action.kind === 'FINALIZE_WORKDAY';
  }

  async createWorkDayDraft(date?: Date) {
    const targetDate = date ?? new Date();
    const existing = await this.workDayRepository.findDraftByDate(targetDate);
    if (existing) {
      return existing;
    }
    return this.workDayRepository.createDraft({ date: targetDate });
  }

  async updateWorkDayDraft(
    workDayId: number,
    data: { startTime?: Date; endTime?: Date; startKm?: number; endKm?: number; totalEarning?: number; platforms?: string[] }
  ) {
    const workDay = await this.workDayRepository.getWorkDayById(workDayId);
    if (!workDay) throw new Error('WORKDAY_NOT_FOUND');
    if (workDay.status !== 'DRAFT') {
      throw new Error('WORKDAY_NOT_EDITABLE');
    }
    return this.workDayRepository.update(workDayId, data);
  }

  async startWorkDay(data: { startKm: number; platforms?: string[] }) {
    const draft = await this.createWorkDayDraft();
    return this.workDayRepository.update(draft.id, {
      startKm: data.startKm,
      startTime: new Date(),
      platforms: data.platforms ?? []
    });
  }

  async endWorkDay(workDayId: number, endKm: number, totalEarning: number) {
    const current = await this.workDayRepository.getWorkDayById(workDayId);
    if (!current) {
      throw new Error('WORKDAY_NOT_FOUND');
    }
    if (current.status !== 'DRAFT') {
      throw new Error('WORKDAY_ALREADY_CLOSED');
    }
    const state = WorkDayState.Draft;
    const machine = new WorkDayMachine(state, { startKm: current.startKm, startTime: current.startTime ?? null });
    const result = machine.transition({ type: 'CLOSE', payload: { endKm, totalEarning, endTime: new Date() } });
    const finalize = result.actions.find(a => this.isFinalizeWorkdayAction(a));
    if (!finalize) {
      throw new Error('UNKNOWN_EVENT');
    }
    await this.workDayRepository.update(workDayId, {
      endKm: finalize.endKm,
      totalEarning: finalize.totalEarning,
      endTime: finalize.endTime
    });
    const workDay = await this.workDayRepository.close(workDayId);
    return workDay;
  }

  async addExpense(workDayId: number, type: string, amount: number, note?: string, occurredAt?: Date) {
    const current = await this.workDayRepository.getWorkDayById(workDayId);
    if (!current) {
      throw new Error('WORKDAY_NOT_FOUND');
    }
    if (current.status === 'CLOSED') {
      throw new Error('WORKDAY_ALREADY_CLOSED');
    }
    const state = WorkDayState.Draft;
    const machine = new WorkDayMachine(state, { startKm: current.startKm, startTime: new Date(current.startTime) });
    const result = machine.transition({ type: 'ADD_EXPENSE', payload: { amount } });
    const action = result.actions.find(a => a.kind === 'RECORD_EXPENSE');
    if (!action) {
      throw new Error('UNKNOWN_EVENT');
    }
    const expense = await this.expenseRepository.createExpense(workDayId, type, action.amount, note, occurredAt);
    return expense;
  }

  async addSegment(workDayId: number, origin: string, destination: string, distanceKm: number) {
    const current = await this.workDayRepository.getWorkDayById(workDayId);
    if (!current) {
      throw new Error('WORKDAY_NOT_FOUND');
    }
    if (current.status === 'CLOSED') {
      throw new Error('WORKDAY_ALREADY_CLOSED');
    }
    if (!(distanceKm > 0 && distanceKm <= 1000)) {
      throw new Error('INVALID_SEGMENT_DISTANCE');
    }
    const segment = await this.segmentRepository.createSegment(workDayId, origin, destination, distanceKm);
    return segment;
  }

  async addGeneralExpense(type: string, amount: number, note?: string, occurredAt?: Date) {
    if (!(amount > 0)) {
      throw new Error('INVALID_EXPENSE_AMOUNT');
    }
    const expense = await this.generalExpenseRepository.create(type, amount, note, occurredAt);
    return expense;
  }

  async getDashboard(): Promise<DashboardSummary> {
    const workDays = await this.workDayRepository.listWorkDays();
    const history = workDays
      .filter(wd => wd.status === 'CLOSED')
      .map(workDay => {
        const totalExpenses = workDay.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = workDay.totalEarning !== null ? workDay.totalEarning - totalExpenses : 0;
        const date = new Date(workDay.date).toISOString().slice(0, 10);
        return { id: workDay.id, date, netProfit };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayProfit = history.filter(h => h.date === todayKey).reduce((sum, h) => sum + h.netProfit, 0);
    return { todayProfit, history };
  }

  async getWorkDayDetail(workDayId: number) {
    const workDay = await this.workDayRepository.getWorkDayById(workDayId);
    if (!workDay) return null;
    const totalExpenses = workDay.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const kmTravelled = workDay.endKm !== null && workDay.startKm !== null ? workDay.endKm - workDay.startKm : null;
    const kmSegments = workDay.segments ? workDay.segments.reduce((sum, s) => sum + s.distanceKm, 0) : 0;
    const hoursWorked = workDay.endTime ? (new Date(workDay.endTime).getTime() - new Date(workDay.startTime).getTime()) / (1000 * 60 * 60) : null;
    const netProfit = workDay.totalEarning !== null ? workDay.totalEarning - totalExpenses : null;
    return {
      id: workDay.id,
      startKm: workDay.startKm,
      endKm: workDay.endKm,
      startTime: workDay.startTime,
      endTime: workDay.endTime,
      totalEarning: workDay.totalEarning,
      totalExpenses,
      kmTravelled,
      kmSegments,
      hoursWorked,
      netProfit,
      expenses: workDay.expenses,
      rides: workDay.rides,
      segments: workDay.segments
    };
  }
}
