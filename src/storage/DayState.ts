import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrentDayState = {
  id: number;
  startKm: number;
  startTime: string;
};

const KEY = 'currentWorkDay';

export async function getCurrentDay(): Promise<CurrentDayState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.id === 'number' && typeof parsed?.startKm === 'number' && typeof parsed?.startTime === 'string') {
      return parsed as CurrentDayState;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCurrentDay(day: { id: number; startKm: number; startTime: string }) {
  await AsyncStorage.setItem(KEY, JSON.stringify(day));
}

export async function clearCurrentDay() {
  await AsyncStorage.removeItem(KEY);
}

const META_KEY = 'currentWorkDayMeta';
const LAST_ENDED_KEY = 'lastEndedWorkDayId';

export type CurrentDayMeta = {
  id: number;
  platforms: ('Uber' | '99' | 'InDrive')[];
};

export async function setCurrentDayMeta(meta: CurrentDayMeta) {
  await AsyncStorage.setItem(META_KEY, JSON.stringify(meta));
}

export async function getCurrentDayMeta(): Promise<CurrentDayMeta | null> {
  const raw = await AsyncStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.id === 'number' && Array.isArray(parsed?.platforms)) {
      return parsed as CurrentDayMeta;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLastEndedDayId(id: number) {
  await AsyncStorage.setItem(LAST_ENDED_KEY, String(id));
}

export async function getLastEndedDayId(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(LAST_ENDED_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
