import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getBaseURL(): string {
  const envURL = process.env.EXPO_PUBLIC_API_URL || 'https://rideon-production.up.railway.app/api';
  console.log('EXPO_PUBLIC_API_URL', envURL);
  
  if (!envURL) {
    throw new Error('EXPO_PUBLIC_API_URL não está definida');
  }

  const trimmed = envURL.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

function generateDeviceId(): string {
  const a = Math.random().toString(36).slice(2, 10);
  const b = Date.now().toString(36);
  return `d_${a}${b}`;
}

async function ensureDeviceIdHeader(): Promise<void> {
  const key = 'device_id';
  let id = await AsyncStorage.getItem(key);
  if (!id) {
    id = generateDeviceId();
    await AsyncStorage.setItem(key, id);
  }
  api.defaults.headers.common['X-Device-Id'] = id;
}

ensureDeviceIdHeader().catch(() => {});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      'Erro ao comunicar com o servidor';
    return Promise.reject(new Error(message));
  }
);
