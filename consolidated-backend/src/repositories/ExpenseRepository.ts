import { prisma } from '../lib/prisma';
import { Expense } from '@prisma/client';

export class ExpenseRepository {
  async createExpense(workDayId: number, type: string, amount: number, note?: string, occurredAt?: Date): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        workDayId,
        type,
        amount,
        note: note ?? null,
        occurredAt: occurredAt ?? null
      }
    });
    return expense;
  }
}
