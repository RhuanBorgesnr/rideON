export function handleApiError(error: any): string {
  if (!error) return 'Erro ao comunicar com o servidor';
  const msg = error?.message || error?.response?.data?.error;
  if (typeof msg === 'string' && msg.trim().length > 0) return msg.trim();
  return 'Erro ao comunicar com o servidor';
}

