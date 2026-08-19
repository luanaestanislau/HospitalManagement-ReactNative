import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch, clearToken, saveToken } from '../services/api';
import type {
  ApiAlertaResponse,
  ApiDashboardResponse,
  ApiPedidoResponse,
  ApiUsuarioResponse,
} from '../types/Api';

type AlertItem = {
  id: string;
  tipo: string;
  prioridade: 'critico' | 'atencao' | 'info';
  titulo: string;
  descricao: string;
  item_id?: string;
  acoes: string[];
};

type StockItem = {
  id: string;
  nome: string;
  quantidade_atual: number;
  quantidade_minima: number;
  status: 'critico' | 'atencao' | 'normal';
  local_armazenamento?: string | null;
  tipo?: string;
};

type Delivery = {
  id: string;
  codigo: string;
  fornecedor: string;
  status: string;
  eta?: string;
  hora_entrega?: string;
  motivo_ocorrencia?: string;
  item?: string;
};

type Transfer = {
  id: string;
  origem: string;
  destino: string;
  item: string;
  quantidade: number;
  urgencia: string;
  status: string;
  sugerida_por_ia: boolean;
};

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

type AppContextValue = {
  bootstrapped: boolean;
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

function mapAlert(alert: ApiAlertaResponse): AlertItem {
  const prioridade =
    alert.severidade === 'CRITICA' || alert.severidade === 'ALTA'
      ? 'critico'
      : alert.severidade === 'MEDIA'
        ? 'atencao'
        : 'info';

  return {
    id: alert.id,
    tipo: alert.tipo,
    prioridade,
    titulo: alert.titulo,
    descricao: alert.mensagem,
    item_id: alert.itemId || undefined,
    acoes: ['Ver'],
  };
}

function mapPedidoToDelivery(pedido: ApiPedidoResponse): Delivery {
  return {
    id: pedido.id,
    codigo: pedido.codigo,
    fornecedor: pedido.fornecedorId,
    status: pedido.status,
    eta: pedido.etaPrevista,
    hora_entrega: pedido.dataEntrega || undefined,
    motivo_ocorrencia: pedido.motivoOcorrencia || undefined,
    item: 'Pedido de insumos',
  };
}

function buildAnalysisFromDashboard(dashboard: ApiDashboardResponse): Analysis {
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
    itensSemLocal: 0,
    itensPrioritarios: total,
    recomendacoes: [],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [user, setUser] = useState<ApiUsuarioResponse | null>(null);
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
    const dashboard = await apiFetch<ApiDashboardResponse>('/dashboard/resumo', { method: 'GET' });

    setAlerts((dashboard.alertasRecentes ?? []).map(mapAlert));
    setDeliveries((dashboard.pedidosDoDia ?? []).map(mapPedidoToDelivery));
    setAnalysis(buildAnalysisFromDashboard(dashboard));

    // Se o backend ainda não entregar itens e transferências no dashboard,
    // deixa vazio ou trata em endpoints próprios no futuro.
    setItems([]);
    setTransfers([]);
  }, []);

  const loadUser = useCallback(async () => {
    const me = await apiFetch<ApiUsuarioResponse>('/auth/me', { method: 'GET' });
    setUser(me);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiFetch<{ token: string; usuario: ApiUsuarioResponse }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha: password }),
      });

      await saveToken(data.token);
      await AsyncStorage.setItem(STORAGE_KEY, data.usuario.email);
      setUser(data.usuario);

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
      await apiFetch('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });
      return true;
    } catch {
      setError('Erro ao cadastrar. Tente novamente.');
      return false;
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
      await loadDashboard();
    } catch (err) {
      console.warn('Erro ao atualizar dashboard:', err);
    }
  }, [loadDashboard, loadUser]);

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
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          await loadUser();
          await loadDashboard();
        }
      } catch (err) {
        console.warn('Erro ao inicializar app:', err);
      } finally {
        setBootstrapped(true);
      }
    })();
  }, [loadDashboard, loadUser]);

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