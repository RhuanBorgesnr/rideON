import { prisma } from '../prisma/client';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Configure a PostgreSQL connection string.');
    process.exit(1);
  }
  try {
    const exp = await prisma.expense.deleteMany({});
    const ride = await prisma.ride.deleteMany({});
    const wd = await prisma.workDay.deleteMany({});
    console.log(JSON.stringify({ expenses_deleted: exp.count, rides_deleted: ride.count, workdays_deleted: wd.count }));
  } catch (e: any) {
    console.error('Failed to delete all records:', e?.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
