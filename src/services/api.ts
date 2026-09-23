import { create } from 'axios';

declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.16:8080/api';

export const api = create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let jwtToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  jwtToken = token;
};

api.interceptors.request.use((config) => {
  if (jwtToken) {
    config.headers.Authorization = `Bearer ${jwtToken}`;
  }
  return config;
});
