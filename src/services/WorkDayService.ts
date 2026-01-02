import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

const scriptURL: string = NativeModules.SourceCode?.scriptURL ?? '';
const devHost = scriptURL ? scriptURL.split('://')[1]?.split(':')[0] : undefined;

function resolveHost(): string {
  if (Platform.OS === 'android') {
    if (devHost === 'localhost' || devHost === '127.0.0.1') return '10.0.2.2';
    return devHost ?? '10.0.2.2';
  }
  if (Platform.OS === 'ios') {
    if (devHost === 'localhost') return '127.0.0.1';
    return devHost ?? '127.0.0.1';
  }
  return devHost ?? '127.0.0.1';
}

const API_URL = `http://192.168.1.6:3000/api`;
const http = axios.create({ baseURL: API_URL, timeout: 10000 });

const startWorkDay = async (startKm: number) => {
  const response = await http.post('/workday/start', { startKm });
  return response.data;
};

const endWorkDay = async (workDayId: number, endKm: number, totalEarning: number) => {
  const response = await http.post('/workday/end', { workDayId, endKm, totalEarning });
  return response.data;
};

const addExpense = async (workDayId: number, type: string, amount: number) => {
  const response = await http.post('/expense', { workDayId, type, amount });
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
  const response = await http.post('/ride', payload);
  return response.data;
};

const getWorkDayDetail = async (workDayId: number) => {
  const response = await http.get(`/workday/${workDayId}`);
  return response.data;
};

const getDashboard = async () => {
  const response = await http.get('/dashboard');
  return response.data;
};

const getRideDaily = async () => {
  const response = await http.get('/ride/daily');
  return response.data;
};

const getRideWeekly = async () => {
  const response = await http.get('/ride/weekly');
  return response.data;
};

export default {
  startWorkDay,
  endWorkDay,
  addExpense,
  addRide,
  getWorkDayDetail,
  getDashboard,
  getRideDaily,
  getRideWeekly
};
