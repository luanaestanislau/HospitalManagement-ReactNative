import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AlertItem, Delivery, StockItem, Transfer, User } from '../data/mockData';
import { apiFetch, clearToken, saveToken } from '../services/api';

type Analysis = {
  scoreInterno: number;
  classificacao: string;
  itensCriticos: number;
  itensSemLocal: number;
  itensPrioritarios: number;
  recomendacoes: Array<{
    item: string;
    status: string;
    localAtual: string;
    localSugerido: string;
    quantidade: number;
    quantidadeSugerida: number;
    prioridade: 'alta' | 'media';
    tempoTransferencia: number;
    motivo: string;
  }>;
};

type DashboardResumo = {
  user: User | null;
  items: StockItem[];
  alerts: AlertItem[];
  deliveries: Delivery[];
  transfers: Transfer[];
  analysis: Analysis;
};

type AppContextValue = {
  bootstrapped: boolean;
  authenticated: boolean;
  user: User | null;
  items: StockItem[];
  alerts: AlertItem[];
  deliveries: Delivery[];
  transfers: Transfer[];
  analysis: Analysis;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nome: string, email: string, senha: string) => Promise<boolean>;
  confirmRegistration: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
};

const STORAGE_KEY = 'medistock.currentUser';

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [analysis, setAnalysis] = useState<Analysis>({
    scoreInterno: 0,
    classificacao: 'Carregando...',
    itensCriticos: 0,
    itensSemLocal: 0,
    itensPrioritarios: 0,
    recomendacoes: [],
  });
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    const data = await apiFetch<DashboardResumo>('/dashboard/resumo', { method: 'GET' });

    setUser(data.user);
    setItems(data.items ?? []);
    setAlerts(data.alerts ?? []);
    setDeliveries(data.deliveries ?? []);
    setTransfers(data.transfers ?? []);
    setAnalysis(
      data.analysis ?? {
        scoreInterno: 0,
        classificacao: 'Sem dados',
        itensCriticos: 0,
        itensSemLocal: 0,
        itensPrioritarios: 0,
        recomendacoes: [],
      },
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiFetch<{ token: string; usuario?: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha: password }),
      });

      await saveToken(data.token);
      if (data.usuario?.email) {
        await AsyncStorage.setItem(STORAGE_KEY, data.usuario.email);
        setUser(data.usuario);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, email);
      }

      await loadDashboard();
      return true;
    } catch {
      setError('E-mail ou senha incorretos.');
      return false;
    }
  }, [loadDashboard]);

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    setError(null);
    try {
      await apiFetch<{ token: string; usuario?: User }>('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });

      // After successful registration, redirect to login
      return true;
    } catch {
      setError('Erro ao cadastrar. Tente novamente.');
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      await loadDashboard();
    } catch (err) {
      console.warn('Erro ao atualizar dashboard:', err);
    }
  }, [loadDashboard]);

  const confirmRegistration = useCallback(async () => {
    setError(null);
    try {
      await apiFetch<{ success: boolean }>('/auth/confirmar-matricula', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await refreshData();
      return true;
    } catch {
      setError('Erro ao confirmar matrícula.');
      return false;
    }
  }, [refreshData]);

  const logout = useCallback(async () => {
    setUser(null);
    setItems([]);
    setAlerts([]);
    setDeliveries([]);
    setTransfers([]);
    setAnalysis({
      scoreInterno: 0,
      classificacao: 'Sem dados',
      itensCriticos: 0,
      itensSemLocal: 0,
      itensPrioritarios: 0,
      recomendacoes: [],
    });

    await clearToken();
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          await loadDashboard();
        }
      } catch (err) {
        console.warn('Erro ao inicializar app:', err);
      } finally {
        setBootstrapped(true);
      }
    })();
  }, [loadDashboard]);

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrapped,
      authenticated: Boolean(user),
      user,
      items,
      alerts,
      deliveries,
      transfers,
      analysis,
      error,
      login,
      register,
      confirmRegistration,
      logout,
      refreshData,
    }),
    [bootstrapped, user, items, alerts, deliveries, transfers, analysis, error, login, register, confirmRegistration, logout, refreshData],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}