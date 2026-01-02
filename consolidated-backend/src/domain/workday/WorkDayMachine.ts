export enum WorkDayState {
  Idle = 'Idle',
  Active = 'Active',
  Closed = 'Closed',
}

export type WorkDayContext = {
  startKm: number | null;
  startTime: Date | null;
  endKm: number | null;
  endTime: Date | null;
  totalEarning: number | null;
};

export type StartEvent = {
  type: 'START';
  payload: { startKm: number; startTime: Date };
};

export type AddExpenseEvent = {
  type: 'ADD_EXPENSE';
  payload: { amount: number };
};

export type AddRideEvent = {
  type: 'ADD_RIDE';
  payload: { earning: number; distanceKm: number; durationMinutes: number };
};

export type EndEvent = {
  type: 'END';
  payload: { endKm: number; totalEarning: number; endTime: Date };
};

export type WorkDayEvent = StartEvent | AddExpenseEvent | AddRideEvent | EndEvent;

export type DomainAction =
  | { kind: 'CREATE_WORKDAY'; startKm: number; startTime: Date }
  | { kind: 'RECORD_EXPENSE'; amount: number }
  | { kind: 'RECORD_RIDE'; earning: number; distanceKm: number; durationMinutes: number }
  | { kind: 'FINALIZE_WORKDAY'; endKm: number; totalEarning: number; endTime: Date };

export type TransitionResult = {
  state: WorkDayState;
  context: WorkDayContext;
  actions: DomainAction[];
};

/**
 * WorkDay state machine: pure domain logic to validate lifecycle transitions and emit actions.
 * States: Idle -> Active -> Closed
 * Events:
 *  - START: Allowed only from Idle, requires startKm > 0 and valid startTime
 *  - ADD_EXPENSE: Allowed only in Active, requires amount > 0
 *  - ADD_RIDE: Allowed only in Active, requires earning >= 0, distanceKm > 0, durationMinutes > 0
 *  - END: Allowed only in Active, requires endKm > startKm, totalEarning >= 0, endTime > startTime
 */
export class WorkDayMachine {
  private state: WorkDayState;
  private context: WorkDayContext;

  constructor(initialState: WorkDayState, initialContext?: Partial<WorkDayContext>) {
    this.state = initialState;
    this.context = {
      startKm: initialContext?.startKm ?? null,
      startTime: initialContext?.startTime ?? null,
      endKm: initialContext?.endKm ?? null,
      endTime: initialContext?.endTime ?? null,
      totalEarning: initialContext?.totalEarning ?? null,
    };
  }

  get current(): { state: WorkDayState; context: WorkDayContext } {
    return { state: this.state, context: this.context };
  }

  transition(event: WorkDayEvent): TransitionResult {
    if (event.type === 'START') {
      if (this.state !== WorkDayState.Idle) {
        throw new Error('OPEN_DAY_EXISTS');
      }
      const { startKm, startTime } = event.payload;
      if (typeof startKm !== 'number' || startKm <= 0) {
        throw new Error('INVALID_START_KM');
      }
      if (!(startTime instanceof Date) || Number.isNaN(startTime.getTime())) {
        throw new Error('INVALID_START_TIME');
      }
      this.state = WorkDayState.Active;
      this.context.startKm = startKm;
      this.context.startTime = startTime;
      return {
        state: this.state,
        context: this.context,
        actions: [{ kind: 'CREATE_WORKDAY', startKm, startTime }],
      };
    }

    if (event.type === 'ADD_EXPENSE') {
      if (this.state !== WorkDayState.Active) {
        if (this.state === WorkDayState.Closed) {
          throw new Error('WORKDAY_ALREADY_ENDED');
        }
        throw new Error('WORKDAY_NOT_STARTED');
      }
      const { amount } = event.payload;
      if (typeof amount !== 'number' || amount <= 0) {
        throw new Error('INVALID_EXPENSE_AMOUNT');
      }
      return {
        state: this.state,
        context: this.context,
        actions: [{ kind: 'RECORD_EXPENSE', amount }],
      };
    }

    if (event.type === 'ADD_RIDE') {
      if (this.state !== WorkDayState.Active) {
        if (this.state === WorkDayState.Closed) {
          throw new Error('WORKDAY_ALREADY_ENDED');
        }
        throw new Error('WORKDAY_NOT_STARTED');
      }
      const { earning, distanceKm, durationMinutes } = event.payload;
      if (typeof earning !== 'number' || earning < 0) {
        throw new Error('INVALID_RIDE_EARNING');
      }
      if (typeof distanceKm !== 'number' || distanceKm <= 0) {
        throw new Error('INVALID_RIDE_DISTANCE');
      }
      if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
        throw new Error('INVALID_RIDE_DURATION');
      }
      return {
        state: this.state,
        context: this.context,
        actions: [{ kind: 'RECORD_RIDE', earning, distanceKm, durationMinutes }],
      };
    }

    if (event.type === 'END') {
      if (this.state !== WorkDayState.Active) {
        if (this.state === WorkDayState.Closed) {
          throw new Error('WORKDAY_ALREADY_ENDED');
        }
        throw new Error('WORKDAY_NOT_STARTED');
      }
      const { endKm, totalEarning, endTime } = event.payload;
      const startKm = this.context.startKm;
      const startTime = this.context.startTime;
      if (typeof endKm !== 'number' || typeof startKm !== 'number' || endKm <= startKm) {
        throw new Error('INVALID_END_KM');
      }
      if (typeof totalEarning !== 'number' || totalEarning < 0) {
        throw new Error('INVALID_TOTAL_EARNING');
      }
      if (!(endTime instanceof Date) || Number.isNaN(endTime.getTime()) || !(startTime instanceof Date) || Number.isNaN(startTime.getTime()) || endTime.getTime() <= startTime.getTime()) {
        throw new Error('INVALID_END_TIME');
      }
      this.state = WorkDayState.Closed;
      this.context.endKm = endKm;
      this.context.endTime = endTime;
      this.context.totalEarning = totalEarning;
      return {
        state: this.state,
        context: this.context,
        actions: [{ kind: 'FINALIZE_WORKDAY', endKm, totalEarning, endTime }],
      };
    }

    throw new Error('UNKNOWN_EVENT');
  }
}

