import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AlertItem, Delivery, StockItem, Transfer } from '../data/mockData';
import { mapAlerta, mapItem, mapPedido, mapPrevisao, type PrevisaoView } from '../services/mappers';
import { ApiError, apiFetch, clearToken, saveToken } from '../services/api';
import type {
  ApiAlertaResponse,
  ApiDashboardResponse,
  ApiItemResponse,
  ApiPaginaResponse,
  ApiPedidoResponse,
  ApiPrevisaoResponse,
  ApiUsuarioResponse,
} from '../types/Api';

type Analysis = {
  scoreInterno: number;
  classificacao: string;
  itensCriticos: number;
  itensPrioritarios: number;
  previsoes: PrevisaoView[];
};

type AppContextValue = {
  bootstrapped: boolean;
  loading: boolean;
  authenticated: boolean;
  user: ApiUsuarioResponse | null;
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
const TOKEN_KEY = 'medistock.token';

const AppContext = createContext<AppContextValue | null>(null);

function buildAnalysisBase(dashboard: ApiDashboardResponse): Omit<Analysis, 'previsoes'> {
  const criticos = dashboard.estoque.criticos ?? 0;
  const atencao = dashboard.estoque.atencao ?? 0;
  const total = dashboard.estoque.total ?? 0;
  const vencendo = dashboard.estoque.vencendo ?? 0;

  const score = Math.max(0, 100 - criticos * 12 - atencao * 4 - vencendo * 6);
  const classificacao = score >= 85 ? 'Otimizado' : score >= 65 ? 'Controlado' : 'Atenção';

  return {
    scoreInterno: score,
    classificacao,
    itensCriticos: criticos,
    itensPrioritarios: total,
  };
}

// Aceita tanto array puro quanto resposta paginada do Spring
// ({ conteudo: [...] }, conforme ApiPaginaResponse<T> em types/Api.ts).
function extrairLista<T>(resposta: T[] | ApiPaginaResponse<T> | null | undefined): T[] {
  if (!resposta) return [];
  if (Array.isArray(resposta)) return resposta;
  return resposta.conteudo ?? [];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<ApiUsuarioResponse | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  // Backend ainda não tem endpoint de transferência entre hospitais.
  const [transfers] = useState<Transfer[]>([]);
  const [analysis, setAnalysis] = useState<Analysis>({
    scoreInterno: 0,
    classificacao: 'Carregando...',
    itensCriticos: 0,
    itensPrioritarios: 0,
    previsoes: [],
  });
  const [error, setError] = useState<string | null>(null);

  const loadItens = useCallback(async () => {
    const resposta = await apiFetch<ApiItemResponse[] | ApiPaginaResponse<ApiItemResponse>>('/itens', {
      method: 'GET',
    });
    const itens = extrairLista(resposta).map(mapItem);
    setItems(itens);
    return itens;
  }, []);

  const loadAlertas = useCallback(async () => {
    const resposta = await apiFetch<ApiAlertaResponse[] | ApiPaginaResponse<ApiAlertaResponse>>('/alertas', {
      method: 'GET',
    });
    setAlerts(extrairLista(resposta).map(mapAlerta));
  }, []);

  const loadDashboard = useCallback(async () => {
    const dashboard = await apiFetch<ApiDashboardResponse>('/dashboard/resumo', { method: 'GET' });

    setDeliveries((dashboard.pedidosDoDia ?? []).map(mapPedido));
    setAnalysis((prev) => ({
      ...buildAnalysisBase(dashboard),
      previsoes: prev.previsoes,
    }));
  }, []);

  // O backend só expõe /previsoes/{itemId} (sem endpoint em lote), e lança
  // 404 se ninguém gerou a previsão daquele item ainda — nesse caso caímos
  // para POST /previsoes/{itemId}/gerar, como a própria API orienta.
  const buscarOuGerarPrevisao = useCallback(async (itemId: string) => {
    try {
      return await apiFetch<ApiPrevisaoResponse>(`/previsoes/${itemId}`, { method: 'GET' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return apiFetch<ApiPrevisaoResponse>(`/previsoes/${itemId}/gerar`, { method: 'POST' });
      }
      throw err;
    }
  }, []);

  const loadPrevisoes = useCallback(async (itensAtuais: StockItem[]) => {
    const criticos = itensAtuais.filter((item) => item.status === 'critico');

    const resultados = await Promise.allSettled(criticos.map((item) => buscarOuGerarPrevisao(item.id)));

    const previsoes = resultados
      .filter((r): r is PromiseFulfilledResult<ApiPrevisaoResponse> => r.status === 'fulfilled')
      .map((r) => mapPrevisao(r.value));

    setAnalysis((prev) => ({ ...prev, previsoes }));
  }, [buscarOuGerarPrevisao]);

  const loadUser = useCallback(async () => {
    const me = await apiFetch<ApiUsuarioResponse>('/auth/me', { method: 'GET' });
    setUser(me);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; usuario: ApiUsuarioResponse }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha: password }),
      });

      await saveToken(data.token);
      await AsyncStorage.setItem(STORAGE_KEY, data.usuario.email);
      setUser(data.usuario);

      try {
        const itens = await loadItens();
        await Promise.allSettled([loadAlertas(), loadDashboard(), loadPrevisoes(itens)]);
      } catch (dataError) {
        console.warn('Login concluído, mas os dados não puderam ser carregados:', dataError);
      }
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível concluir o login.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAlertas, loadDashboard, loadItens, loadPrevisoes]);

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cadastrar. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmRegistration = useCallback(async () => {
    setError(null);
    try {
      await apiFetch('/auth/me', { method: 'GET' });
      await loadUser();
      return true;
    } catch {
      setError('Erro ao confirmar matrícula.');
      return false;
    }
  }, [loadUser]);

  const refreshData = useCallback(async () => {
    try {
      await loadUser();
      const itens = await loadItens();
      await Promise.allSettled([loadAlertas(), loadDashboard(), loadPrevisoes(itens)]);
    } catch (err) {
      console.warn('Erro ao atualizar dados:', err);
    }
  }, [loadAlertas, loadDashboard, loadItens, loadPrevisoes, loadUser]);

  const logout = useCallback(async () => {
    setUser(null);
    setItems([]);
    setAlerts([]);
    setDeliveries([]);
    setAnalysis({
      scoreInterno: 0,
      classificacao: 'Sem dados',
      itensCriticos: 0,
      itensPrioritarios: 0,
      previsoes: [],
    });

    await clearToken();
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          await loadUser();
          const itens = await loadItens();
          await Promise.allSettled([loadAlertas(), loadDashboard(), loadPrevisoes(itens)]);
        }
      } catch (err) {
        console.warn('Erro ao inicializar app:', err);
        // Token expirado/inválido/de um backend em memória que reiniciou:
        // limpa pra não repetir esse erro a cada abertura do app.
        if (err instanceof ApiError && err.status === 401) {
          await clearToken();
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        setBootstrapped(true);
      }
    })();
  }, [loadAlertas, loadDashboard, loadItens, loadPrevisoes, loadUser]);

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrapped,
      loading,
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
    [bootstrapped, loading, user, items, alerts, deliveries, transfers, analysis, error, login, register, confirmRegistration, logout, refreshData],
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