import AsyncStorage from '@react-native-async-storage/async-storage';

declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

// Em aparelho físico, use o IP da máquina que executa a API (não `localhost`).
// Ex.: EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api/v1
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'medistock.token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data === 'string') return data;
    if (data?.mensagem) return data.mensagem;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return JSON.stringify(data);
  } catch {
    return response.statusText || `Request failed with status ${response.status}`;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const headers: HeadersInit_ = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      `Não foi possível conectar à API em ${API_URL}. Verifique se ela está em execução e se a URL é acessível pelo dispositivo.`,
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
