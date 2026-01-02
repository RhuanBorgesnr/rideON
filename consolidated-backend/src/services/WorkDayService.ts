import { WorkDayRepository } from '../repositories/WorkDayRepository';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { WorkDayMachine, WorkDayState } from '../domain/workday/WorkDayMachine';
import { IWorkDayRepository, IExpenseRepository } from '../application/ports/workday';

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

  constructor() {
    this.workDayRepository = new WorkDayRepository();
    this.expenseRepository = new ExpenseRepository();
  }

  async startWorkDay(startKm: number) {
    const open = await this.workDayRepository.findOpenWorkDay();
    const machine = new WorkDayMachine(open ? WorkDayState.Active : WorkDayState.Idle);
    const result = machine.transition({ type: 'START', payload: { startKm, startTime: new Date() } });
    const create = result.actions.find(a => a.kind === 'CREATE_WORKDAY');
    if (!create) {
      throw new Error('UNKNOWN_EVENT');
    }
    const workDay = await this.workDayRepository.createWorkDay(create.startKm);
    return workDay;
  }

  async endWorkDay(workDayId: number, endKm: number, totalEarning: number) {
    const current = await this.workDayRepository.getWorkDayById(workDayId);
    if (!current) {
      throw new Error('WORKDAY_NOT_FOUND');
    }
    const state = current.endTime ? WorkDayState.Closed : WorkDayState.Active;
    const machine = new WorkDayMachine(state, { startKm: current.startKm, startTime: new Date(current.startTime) });
    const result = machine.transition({ type: 'END', payload: { endKm, totalEarning, endTime: new Date() } });
    const finalize = result.actions.find(a => a.kind === 'FINALIZE_WORKDAY');
    if (!finalize) {
      throw new Error('UNKNOWN_EVENT');
    }
    const workDay = await this.workDayRepository.endWorkDay(workDayId, finalize.endKm, finalize.totalEarning);
    return workDay;
  }

  async addExpense(workDayId: number, type: string, amount: number) {
    const current = await this.workDayRepository.getWorkDayById(workDayId);
    if (!current) {
      throw new Error('WORKDAY_NOT_FOUND');
    }
    const state = current.endTime ? WorkDayState.Closed : WorkDayState.Active;
    const machine = new WorkDayMachine(state, { startKm: current.startKm, startTime: new Date(current.startTime) });
    const result = machine.transition({ type: 'ADD_EXPENSE', payload: { amount } });
    const action = result.actions.find(a => a.kind === 'RECORD_EXPENSE');
    if (!action) {
      throw new Error('UNKNOWN_EVENT');
    }
    const expense = await this.expenseRepository.createExpense(workDayId, type, action.amount);
    return expense;
  }

  async getDashboard(): Promise<DashboardSummary> {
    const workDays = await this.workDayRepository.listWorkDays();
    const history = workDays.map(workDay => {
      const totalExpenses = workDay.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const netProfit = workDay.totalEarning !== null ? workDay.totalEarning - totalExpenses : 0;
      const date = new Date(workDay.startTime).toISOString().slice(0, 10);
      return { id: workDay.id, date, netProfit };
    }).sort((a, b) => (a.date < b.date ? 1 : -1));
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayProfit = history.filter(h => h.date === todayKey).reduce((sum, h) => sum + h.netProfit, 0);
    return { todayProfit, history };
  }

  async getWorkDayDetail(workDayId: number) {
    const workDay = await this.workDayRepository.getWorkDayById(workDayId);
    if (!workDay) return null;
    const totalExpenses = workDay.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const kmTravelled = workDay.endKm !== null && workDay.startKm !== null ? workDay.endKm - workDay.startKm : null;
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
      hoursWorked,
      netProfit,
      expenses: workDay.expenses,
      rides: workDay.rides
    };
  }
}
