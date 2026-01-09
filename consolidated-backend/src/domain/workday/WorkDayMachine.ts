export enum WorkDayState {
  Draft = 'DRAFT',
  Closed = 'CLOSED',
}

export type WorkDayContext = {
  startKm: number | null;
  startTime: Date | null;
  endKm: number | null;
  endTime: Date | null;
  totalEarning: number | null;
};

export type UpdateInfoEvent = {
  type: 'UPDATE_INFO';
  payload: { startKm?: number; startTime?: Date; endTime?: Date; endKm?: number; totalEarning?: number };
};

export type AddExpenseEvent = {
  type: 'ADD_EXPENSE';
  payload: { amount: number };
};

export type AddRideEvent = {
  type: 'ADD_RIDE';
  payload: { earning: number; distanceKm: number; durationMinutes: number };
};

export type CloseEvent = {
  type: 'CLOSE';
  payload: { endKm: number; totalEarning: number; endTime: Date };
};

export type WorkDayEvent = UpdateInfoEvent | AddExpenseEvent | AddRideEvent | CloseEvent;

export type DomainAction =
  | { kind: 'UPDATE_DRAFT_INFO'; startKm?: number; startTime?: Date; endTime?: Date; endKm?: number; totalEarning?: number }
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
 * States: Draft -> Closed
 * Events:
 *  - UPDATE_INFO: Allowed only in Draft, basic validations when present
 *  - ADD_EXPENSE: Allowed only in Draft, requires amount > 0
 *  - ADD_RIDE: Allowed only in Draft, requires earning >= 0, distanceKm > 0, durationMinutes > 0
 *  - CLOSE: Allowed only in Draft, requires endKm > startKm, totalEarning >= 0, endTime > startTime
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
    if (event.type === 'UPDATE_INFO') {
      if (this.state !== WorkDayState.Draft) {
        throw new Error('WORKDAY_NOT_DRAFT');
      }
      const { startKm, startTime, endTime, endKm, totalEarning } = event.payload;
      if (startKm !== undefined && (typeof startKm !== 'number' || startKm <= 0)) {
        throw new Error('INVALID_START_KM');
      }
      if (endKm !== undefined && typeof endKm !== 'number') {
        throw new Error('INVALID_END_KM');
      }
      if (totalEarning !== undefined && (typeof totalEarning !== 'number' || totalEarning < 0)) {
        throw new Error('INVALID_TOTAL_EARNING');
      }
      if (startTime !== undefined && (!(startTime instanceof Date) || Number.isNaN(startTime.getTime()))) {
        throw new Error('INVALID_START_TIME');
      }
      if (endTime !== undefined && (!(endTime instanceof Date) || Number.isNaN(endTime.getTime()))) {
        throw new Error('INVALID_END_TIME');
      }
      if (startKm !== undefined) this.context.startKm = startKm;
      if (startTime !== undefined) this.context.startTime = startTime;
      if (endKm !== undefined) this.context.endKm = endKm;
      if (endTime !== undefined) this.context.endTime = endTime;
      if (totalEarning !== undefined) this.context.totalEarning = totalEarning;
      return {
        state: this.state,
        context: this.context,
        actions: [{ kind: 'UPDATE_DRAFT_INFO', startKm, startTime, endKm, endTime, totalEarning }],
      };
    }

    if (event.type === 'ADD_EXPENSE') {
      if (this.state !== WorkDayState.Draft) {
        if (this.state === WorkDayState.Closed) {
          throw new Error('WORKDAY_ALREADY_CLOSED');
        }
        throw new Error('WORKDAY_NOT_DRAFT');
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
      if (this.state !== WorkDayState.Draft) {
        if (this.state === WorkDayState.Closed) {
          throw new Error('WORKDAY_ALREADY_CLOSED');
        }
        throw new Error('WORKDAY_NOT_DRAFT');
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

    if (event.type === 'CLOSE') {
      if (this.state !== WorkDayState.Draft) {
        if (this.state === WorkDayState.Closed) {
          throw new Error('WORKDAY_ALREADY_CLOSED');
        }
        throw new Error('WORKDAY_NOT_DRAFT');
      }
      const { endKm, totalEarning, endTime } = event.payload;
      const startKm = this.context.startKm;
      const startTime = this.context.startTime;
      if (typeof endKm !== 'number' || typeof startKm !== 'number' || endKm < startKm) {
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
