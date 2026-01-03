import axios from 'axios';

function getBaseURL(): string {
  const envURL = process.env.EXPO_PUBLIC_API_URL;
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
