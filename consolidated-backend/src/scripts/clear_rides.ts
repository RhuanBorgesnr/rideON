import { prisma } from '../prisma/client';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Configure a PostgreSQL connection string.');
    process.exit(1);
  }
  try {
    const res = await prisma.ride.deleteMany({});
    console.log(`Deleted rides: ${res.count}`);
  } catch (e: any) {
    console.error('Failed to delete rides:', e?.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
