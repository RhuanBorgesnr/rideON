import http from 'http';
import app from '../app';
import { prisma } from '../prisma/client';

type TestResult = {
  name: string;
  passed: boolean;
  status: number;
  expectedStatus: number;
  detail?: string;
};

const log = (...args: any[]) => {
  // Simple logger to keep output readable
  console.log(...args);
};

function startServer(): Promise<{ server: http.Server; baseURL: string }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to acquire server address'));
        return;
      }
      const baseURL = `http://127.0.0.1:${address.port}/api`;
      resolve({ server, baseURL });
    });
    server.on('error', reject);
  });
}

function request(
  baseURL: string,
  method: 'GET' | 'POST',
  path: string,
  body?: any
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(baseURL + path);
    const payload = body ? JSON.stringify(body) : undefined;
    const opts: http.RequestOptions = {
      hostname: url.hostname,
      port: Number(url.port),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload ? Buffer.byteLength(payload) : 0
      },
      timeout: 10000
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const data = raw ? JSON.parse(raw) : {};
          resolve({ status: res.statusCode || 0, data });
        } catch (e) {
          resolve({ status: res.statusCode || 0, data: { parseError: String(e), raw } });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function ensureCleanDatabase() {
  await prisma.expense.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.workDay.deleteMany({});
}

async function run() {
  const results: TestResult[] = [];
  let server: http.Server | null = null;
  let baseURL = '';
  let workDayId: number | null = null;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set. Configure a PostgreSQL connection string.');
    }
    await ensureCleanDatabase();
    const boot = await startServer();
    server = boot.server;
    baseURL = boot.baseURL;
    log('Server started for tests at', baseURL);

    // 1) Workday Start - Missing payload
    {
      const res = await request(baseURL, 'POST', '/workday/start', {});
      results.push({
        name: 'POST /workday/start - missing startKm',
        passed: res.status === 400 && res.data?.error === 'startKm is required',
        status: res.status,
        expectedStatus: 400,
        detail: JSON.stringify(res.data)
      });
    }

    // 2) Workday Start - Positive
    {
      const res = await request(baseURL, 'POST', '/workday/start', { startKm: 100 });
      workDayId = res.data?.id ?? null;
      results.push({
        name: 'POST /workday/start - valid',
        passed: res.status === 201 && typeof workDayId === 'number' && res.data?.startKm === 100,
        status: res.status,
        expectedStatus: 201,
        detail: JSON.stringify(res.data)
      });
    }

    // 3) Expense - Missing fields
    {
      const res = await request(baseURL, 'POST', '/expense', { workDayId, amount: 50 });
      results.push({
        name: 'POST /expense - missing type',
        passed: res.status === 400 && res.data?.error === 'workDayId, type and amount are required',
        status: res.status,
        expectedStatus: 400,
        detail: JSON.stringify(res.data)
      });
    }

    // 4) Expense - Positive
    {
      const res = await request(baseURL, 'POST', '/expense', { workDayId, type: 'Combustível', amount: 50 });
      results.push({
        name: 'POST /expense - valid',
        passed: res.status === 201 && res.data?.type === 'Combustível' && res.data?.amount === 50,
        status: res.status,
        expectedStatus: 201,
        detail: JSON.stringify(res.data)
      });
    }

    // 5) Ride - Missing required fields
    {
      const res = await request(baseURL, 'POST', '/ride', { workDayId, distanceKm: 10, durationMinutes: 30 });
      results.push({
        name: 'POST /ride - missing earning',
        passed: res.status === 400 && res.data?.error === 'earning, distanceKm and durationMinutes are required',
        status: res.status,
        expectedStatus: 400,
        detail: JSON.stringify(res.data)
      });
    }

    // 6) Ride - Positive
    {
      const res = await request(baseURL, 'POST', '/ride', { workDayId, earning: 80, distanceKm: 10, durationMinutes: 30, fuelCost: 10 });
      const net = res.data?.netProfit;
      results.push({
        name: 'POST /ride - valid',
        passed: res.status === 201 && typeof net === 'number' && Math.abs(net - 70) < 0.001,
        status: res.status,
        expectedStatus: 201,
        detail: JSON.stringify(res.data)
      });
    }

    // 7) Workday End - Missing fields
    {
      const res = await request(baseURL, 'POST', '/workday/end', { workDayId });
      results.push({
        name: 'POST /workday/end - missing required fields',
        passed: res.status === 400 && res.data?.error === 'workDayId, endKm and totalEarning are required',
        status: res.status,
        expectedStatus: 400,
        detail: JSON.stringify(res.data)
      });
    }

    // 8) Workday End - Positive
    {
      const res = await request(baseURL, 'POST', '/workday/end', { workDayId, endKm: 150, totalEarning: 200 });
      results.push({
        name: 'POST /workday/end - valid',
        passed: res.status === 200 && res.data?.endKm === 150 && res.data?.totalEarning === 200,
        status: res.status,
        expectedStatus: 200,
        detail: JSON.stringify(res.data)
      });
    }

    // 9) WorkDay Detail - Positive
    {
      const res = await request(baseURL, 'GET', `/workday/${workDayId}`);
      const net = res.data?.netProfit;
      const expensesTotal = res.data?.totalExpenses;
      const km = res.data?.kmTravelled;
      results.push({
        name: 'GET /workday/:id - valid',
        passed:
          res.status === 200 &&
          Array.isArray(res.data?.expenses) &&
          res.data?.expenses.length >= 1 &&
          Array.isArray(res.data?.rides) &&
          res.data?.rides.length >= 1 &&
          expensesTotal === 50 &&
          km === 50 &&
          typeof net === 'number' &&
          Math.abs(net - (200 - 50)) < 0.001,
        status: res.status,
        expectedStatus: 200,
        detail: JSON.stringify(res.data)
      });
    }

    // 10) WorkDay Detail - Invalid id type
    {
      const res = await request(baseURL, 'GET', `/workday/abc`);
      results.push({
        name: 'GET /workday/:id - invalid id',
        passed: res.status === 400 && res.data?.error === 'Invalid id',
        status: res.status,
        expectedStatus: 400,
        detail: JSON.stringify(res.data)
      });
    }

    // 11) WorkDay Detail - Not found
    {
      const res = await request(baseURL, 'GET', `/workday/999999`);
      results.push({
        name: 'GET /workday/:id - not found',
        passed: res.status === 404 && res.data?.error === 'Not found',
        status: res.status,
        expectedStatus: 404,
        detail: JSON.stringify(res.data)
      });
    }

    // 12) Dashboard
    {
      const res = await request(baseURL, 'GET', `/dashboard`);
      const hist = res.data?.history;
      const today = res.data?.todayProfit;
      results.push({
        name: 'GET /dashboard',
        passed: res.status === 200 && Array.isArray(hist) && hist.length >= 1 && typeof today === 'number',
        status: res.status,
        expectedStatus: 200,
        detail: JSON.stringify(res.data)
      });
    }

    // 13) Ride Daily
    {
      const res = await request(baseURL, 'GET', `/ride/daily`);
      results.push({
        name: 'GET /ride/daily',
        passed: res.status === 200 && Array.isArray(res.data),
        status: res.status,
        expectedStatus: 200,
        detail: JSON.stringify(res.data)
      });
    }

    // 14) Ride Weekly
    {
      const res = await request(baseURL, 'GET', `/ride/weekly`);
      results.push({
        name: 'GET /ride/weekly',
        passed: res.status === 200 && Array.isArray(res.data),
        status: res.status,
        expectedStatus: 200,
        detail: JSON.stringify(res.data)
      });
    }

  } catch (e: any) {
    log('Fatal error running tests:', e?.message || e);
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }
    await prisma.$disconnect();
  }

  // Report
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  log('--- Detailed Results ---');
  results.forEach(r => {
    log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.name} | status=${r.status} expected=${r.expectedStatus}`);
    log(`  detail: ${r.detail}`);
  });
  log('--- Summary ---');
  log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  // Exit code reflects success/failure
  if (failed > 0) {
    process.exit(1);
  }
}

run();

