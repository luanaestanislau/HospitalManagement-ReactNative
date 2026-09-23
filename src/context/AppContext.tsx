import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL, api, setAuthToken } from '../services/api';
import {
  mapAlertaToUi,
  mapAnaliseToUi,
  mapEntregaToUi,
  mapItemEstoqueToUi,
  mapTransferenciaToUi,
} from '../services/mappers';
import type { LogisticaMapaResponse, RedistribuicaoResponse } from '../types/ApiTypes';
interface UserProfile {
  nome: string;
  email: string;
  matricula?: string;
  departamento?: string;
  cargo?: string;
  registroProfissional?: string;
  hospital?: string;
}

interface Analysis {
  scoreInterno: number;
  classificacao: string;
  itensCriticos: number;
  itensPrioritarios: number;
  previsoes: {
    itemId: string;
    demandaProjetada: number;
    diasProjetados: number;
    mediaMovelSimples: number;
    sugestaoCompra: number;
    confianca: number;
  }[];
}

interface AppContextData {
  authenticated: boolean;
  bootstrapped: boolean;
  loading: boolean;
  error: string | null;
  user: UserProfile | null;
  items: any[];
  alerts: any[];
  deliveries: any[];
  transfers: any[];
  logisticsMap: LogisticaMapaResponse;
  redistributionSuggestions: RedistribuicaoResponse[];
  analysis: Analysis;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (nome: string, email: string, pass: string) => Promise<boolean>;
  confirmRegistration: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  confirmRedistribution: (itemEstoqueId: number, quantidade?: number) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AppContext = createContext({} as AppContextData);

function getApiErrorMessage(error: any, fallback: string) {
  const data = error.response?.data;
  if (data?.campos) {
    return Object.values(data.campos).join('\n');
  }
  if (data?.mensagem || data?.message) {
    return data.mensagem ?? data.message;
  }
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return `Não foi possível conectar à API em ${API_BASE_URL}. Confirme que o backend está em execução e que o celular está na mesma rede Wi-Fi.`;
  }
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [bootstrapped] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [logisticsMap, setLogisticsMap] = useState<LogisticaMapaResponse>({
    hospitais: [],
    transferenciasAtivas: [],
  });
  const [redistributionSuggestions, setRedistributionSuggestions] = useState<RedistribuicaoResponse[]>([]);
  const [analysis, setAnalysis] = useState<Analysis>({
    scoreInterno: 0,
    classificacao: 'INICIAL',
    itensCriticos: 0,
    itensPrioritarios: 0,
    previsoes: [],
  });

  const fetchMatricula = async (): Promise<boolean> => {
    try {
      const response = await api.get('/perfil/matricula');
      const data = response.data;
      setUser((prev) => ({
        nome: data.nomeCompleto,
        email: prev?.email || '',
        matricula: data.matricula,
        departamento: data.departamento,
        cargo: data.cargo,
        registroProfissional: data.registroProfissional,
        hospital: data.hospital,
      }));
      return true;
    } catch (err: any) {
      console.error('Erro ao buscar matrícula:', err);
      return false;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [resEstoque, resAlertas, resEntregas, resTransf, resIa, resMapa, resRedistribuicao] = await Promise.all([
        api.get('/estoque'),
        api.get('/alertas'),
        api.get('/logistica/entregas'),
        api.get('/logistica/transferencias'),
        api.get('/ia/analise-interna'),
        api.get<LogisticaMapaResponse>('/logistica/mapa').catch(() => null),
        api.get<RedistribuicaoResponse[]>('/ia/redistribuicao').catch(() => null),
      ]);

      setItems(resEstoque.data.map(mapItemEstoqueToUi));
      setAlerts(resAlertas.data.map(mapAlertaToUi));
      setDeliveries(resEntregas.data.map(mapEntregaToUi));
      setTransfers(resTransf.data.map(mapTransferenciaToUi));
      setAnalysis(mapAnaliseToUi(resIa.data));
      if (resMapa) setLogisticsMap(resMapa.data);
      if (resRedistribuicao) setRedistributionSuggestions(resRedistribuicao.data);
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmRedistribution = async (itemEstoqueId: number, quantidade?: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/ia/redistribuicao/${itemEstoqueId}/confirmar`, quantidade ? { quantidade } : undefined);
      await refreshData();
      return true;
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Não foi possível criar a transferência sugerida pela IA.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', {
        emailInstitucional: email,
        senha,
      });

      const { token, usuario } = response.data;
      setAuthToken(token);
      setAuthenticated(true);
      setUser({
        nome: `${usuario.primeiroNome} ${usuario.ultimoNome}`,
        email: usuario.emailInstitucional,
      });

      await fetchMatricula();
      return true;
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'E-mail ou senha inválidos.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const nameParts = nome.trim().split(' ');
      const primeiroNome = nameParts[0] || nome;
      const ultimoNome = nameParts.slice(1).join(' ') || 'Servidor';

      const response = await api.post('/auth/registrar', {
        primeiroNome,
        ultimoNome,
        emailInstitucional: email,
        senha,
      });

      const { token, usuario } = response.data;
      setAuthToken(token);
      setAuthenticated(true);
      setUser({
        nome: `${usuario.primeiroNome} ${usuario.ultimoNome}`,
        email: usuario.emailInstitucional,
      });

      await fetchMatricula();
      return true;
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Erro ao realizar cadastro.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmRegistration = async (): Promise<boolean> => {
    await refreshData();
    return true;
  };

  const logout = async () => {
    setAuthToken(null);
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        authenticated,
        bootstrapped,
        loading,
        error,
        user,
        items,
        alerts,
        deliveries,
        transfers,
        logisticsMap,
        redistributionSuggestions,
        analysis,
        login,
        register,
        confirmRegistration,
        refreshData,
        confirmRedistribution,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
