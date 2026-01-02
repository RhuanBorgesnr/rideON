import { WorkDayMachine, WorkDayState } from '../domain/workday/WorkDayMachine';

type TestResult = { name: string; passed: boolean; detail?: string };

function runTest(name: string, fn: () => void): TestResult {
  try {
    fn();
    return { name, passed: true };
  } catch (e: any) {
    return { name, passed: false, detail: e?.message || String(e) };
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function main() {
  const results: TestResult[] = [];

  results.push(runTest('Idle -> START -> Active with CREATE_WORKDAY', () => {
    const m = new WorkDayMachine(WorkDayState.Idle);
    const r = m.transition({ type: 'START', payload: { startKm: 100, startTime: new Date() } });
    assert(r.state === WorkDayState.Active, 'State should be Active');
    assert(r.actions.some(a => a.kind === 'CREATE_WORKDAY'), 'CREATE_WORKDAY action required');
  }));

  results.push(runTest('Active -> ADD_EXPENSE -> Active with RECORD_EXPENSE', () => {
    const m = new WorkDayMachine(WorkDayState.Active, { startKm: 100, startTime: new Date(Date.now() - 1000) });
    const r = m.transition({ type: 'ADD_EXPENSE', payload: { amount: 50 } });
    assert(r.state === WorkDayState.Active, 'State remains Active');
    assert(r.actions.some(a => a.kind === 'RECORD_EXPENSE'), 'RECORD_EXPENSE action required');
  }));

  results.push(runTest('Active -> END invalid endKm', () => {
    const m = new WorkDayMachine(WorkDayState.Active, { startKm: 100, startTime: new Date(Date.now() - 1000) });
    try {
      m.transition({ type: 'END', payload: { endKm: 50, totalEarning: 200, endTime: new Date() } });
      throw new Error('Expected INVALID_END_KM');
    } catch (e: any) {
      assert(e.message === 'INVALID_END_KM', 'Should throw INVALID_END_KM');
    }
  }));

  results.push(runTest('Active -> END valid -> Closed with FINALIZE_WORKDAY', () => {
    const m = new WorkDayMachine(WorkDayState.Active, { startKm: 100, startTime: new Date(Date.now() - 1000) });
    const r = m.transition({ type: 'END', payload: { endKm: 150, totalEarning: 200, endTime: new Date() } });
    assert(r.state === WorkDayState.Closed, 'State should be Closed');
    assert(r.actions.some(a => a.kind === 'FINALIZE_WORKDAY'), 'FINALIZE_WORKDAY action required');
  }));

  results.push(runTest('Closed -> ADD_EXPENSE should fail', () => {
    const m = new WorkDayMachine(WorkDayState.Closed, { startKm: 100, startTime: new Date(Date.now() - 1000) });
    try {
      m.transition({ type: 'ADD_EXPENSE', payload: { amount: 10 } });
      throw new Error('Expected WORKDAY_ALREADY_ENDED');
    } catch (e: any) {
      assert(e.message === 'WORKDAY_ALREADY_ENDED', 'Should throw WORKDAY_ALREADY_ENDED');
    }
  }));

  results.push(runTest('Active -> START should fail', () => {
    const m = new WorkDayMachine(WorkDayState.Active, { startKm: 100, startTime: new Date(Date.now() - 1000) });
    try {
      m.transition({ type: 'START', payload: { startKm: 120, startTime: new Date() } });
      throw new Error('Expected OPEN_DAY_EXISTS');
    } catch (e: any) {
      assert(e.message === 'OPEN_DAY_EXISTS', 'Should throw OPEN_DAY_EXISTS');
    }
  }));

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  // eslint-disable-next-line no-console
  console.log('--- WorkDayMachine Unit Results ---');
  results.forEach(r => {
    // eslint-disable-next-line no-console
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.name}${r.detail ? ` | detail=${r.detail}` : ''}`);
  });
  // eslint-disable-next-line no-console
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();

