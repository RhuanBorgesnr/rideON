import { prisma } from '../lib/prisma';
import { Expense } from '@prisma/client';

export class ExpenseRepository {
  async createExpense(workDayId: number, type: string, amount: number): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        workDayId,
        type,
        amount
      }
    });
    return expense;
  }
}
