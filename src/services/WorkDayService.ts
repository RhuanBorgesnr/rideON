import { api } from './api';


const startWorkDay = async (startKm: number) => {
  const response = await api.post('/workday/start', { startKm });
  return response.data;
};

const endWorkDay = async (workDayId: number, endKm: number, totalEarning: number) => {
  const response = await api.post('/workday/end', { workDayId, endKm, totalEarning });
  return response.data;
};

const addExpense = async (workDayId: number, type: string, amount: number, note?: string, occurredAt?: string) => {
  const payload: any = { workDayId, type, amount };
  if (note !== undefined) payload.note = note;
  if (occurredAt !== undefined) payload.occurredAt = occurredAt;
  const response = await api.post('/expense', payload);
  return response.data;
};

const addGeneralExpense = async (type: string, amount: number, note?: string, occurredAt?: string) => {
  const payload: any = { type, amount };
  if (note !== undefined) payload.note = note;
  if (occurredAt !== undefined) payload.occurredAt = occurredAt;
  const response = await api.post('/expense/general', payload);
  return response.data;
};

const addSegment = async (workDayId: number, origin: string, destination: string, distanceKm: number) => {
  const response = await api.post('/segment', { workDayId, origin, destination, distanceKm });
  return response.data;
};

const addRide = async (payload: {
  workDayId?: number;
  earning: number;
  distanceKm: number;
  durationMinutes: number;
  fuelCost?: number;
  feeCost?: number;
  maintenanceCost?: number;
  otherCost?: number;
}) => {
  const response = await api.post('/ride', payload);
  return response.data;
};

const getWorkDayDetail = async (workDayId: number) => {
  const response = await api.get(`/workday/${workDayId}`);
  return response.data;
};

const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

const getRideDaily = async () => {
  const response = await api.get('/ride/daily');
  return response.data;
};

const getRideWeekly = async () => {
  const response = await api.get('/ride/weekly');
  return response.data;
};

export default {
  startWorkDay,
  endWorkDay,
  addExpense,
  addGeneralExpense,
  addSegment,
  addRide,
  getWorkDayDetail,
  getDashboard,
  getRideDaily,
  getRideWeekly
};
