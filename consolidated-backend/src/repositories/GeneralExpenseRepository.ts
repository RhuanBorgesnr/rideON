import { prisma } from '../lib/prisma';

export class GeneralExpenseRepository {
  async create(type: string, amount: number, note?: string, occurredAt?: Date): Promise<any> {
    const expense = await (prisma as any).generalExpense.create({
      data: {
        type,
        amount,
        note: note ?? null,
        occurredAt: occurredAt ?? null
      }
    });
    return expense;
  }
}
