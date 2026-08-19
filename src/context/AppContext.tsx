import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  AlertItem,
  Delivery,
  initialDeliveries,
  initialItems,
  initialTransfers,
  initialUsers,
  institutionalDomains,
  StockItem,
  Transfer,
  User,
} from '../data/mockData';

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
  user: User | null;
  users: User[];
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
  refreshData: () => void;
  recalculateStock: (itemId: number) => void;
  addPushAlert: (titulo: string, descricao: string, prioridade?: AlertItem['prioridade'], tipo?: AlertItem['tipo']) => void;
};

const STORAGE_KEY = 'medistock.currentUser';
const USERS_KEY = 'medistock.users';

const AppContext = createContext<AppContextValue | null>(null);

function normalizeDomain(email: string) {
  return email.trim().split('@').pop()?.toLowerCase() ?? '';
}

function scoreClass(score: number) {
  if (score >= 85) return 'Otimizado';
  if (score >= 65) return 'Controlado';
  return 'Atenção';
}

function suggestLocal(item: StockItem) {
  const categoria = item.categoria?.toLowerCase() ?? '';
  if (categoria.includes('quimioter')) return 'Oncologia - Geladeira Especializada';
  if (categoria.includes('trombol')) return 'Emergência - Armário Refrigerado A';
  if (categoria.includes('imunossup')) return 'Hematologia - Refrigerador';
  if (categoria.includes('neurol')) return 'Neurologia Pediátrica - Geladeira';
  if (categoria.includes('imunobiol')) return 'Câmara Fria 01';
  if (item.local_armazenamento) return item.local_armazenamento;
  return 'Farmácia Central A1';
}

function transferTime(item: StockItem) {
  if (item.status === 'critico') return 20;
  if (item.status === 'atencao') return 40;
  return 60;
}

function motive(item: StockItem) {
  if (item.status === 'critico') return 'Reposição imediata para reduzir tempo de transferência';
  if (item.status === 'atencao') return 'Manter perto do ponto de uso e evitar retrabalho logístico';
  return 'Estoque estável, sem necessidade de movimentação urgente';
}

function deriveAlerts(items: StockItem[]): AlertItem[] {
  return items
    .filter((item) => item.status === 'critico')
    .map((item) => ({
      id: item.id,
      tipo: 'estoque_critico' as const,
      prioridade: 'critico' as const,
      titulo: item.nome,
      descricao: `Qtd: ${item.quantidade_atual} · Mín: ${item.quantidade_minima}`,
      item_id: item.id,
      acoes: ['Repor', 'Ver', 'Redistribuir'],
    }));
}

function deriveAnalysis(items: StockItem[]): Analysis {
  const prioritarios = items.filter((item) => item.tipo === 'essencial_baixa_demanda');
  const semLocal = prioritarios.filter((item) => !item.local_armazenamento).length;
  const criticos = prioritarios.filter((item) => item.status === 'critico').length;
  const atencao = prioritarios.filter((item) => item.status === 'atencao').length;

  const recomendacoes = prioritarios
    .map((item) => {
      const atual = item.quantidade_atual;
      const minimo = item.quantidade_minima;
      const recomendado = item.quantidade_recomendada_ia ?? minimo;
      return {
        item: item.nome,
        status: item.status,
        localAtual: item.local_armazenamento ?? 'Não definido',
        localSugerido: suggestLocal(item),
        quantidade: atual,
        quantidadeSugerida: Math.max(recomendado, minimo),
        prioridade: atual <= minimo ? ('alta' as const) : ('media' as const),
        tempoTransferencia: transferTime(item),
        motivo: motive(item),
      };
    })
    .sort((a, b) => {
      const order = (value: 'alta' | 'media') => (value === 'alta' ? 0 : 1);
      if (order(a.prioridade) !== order(b.prioridade)) return order(a.prioridade) - order(b.prioridade);
      return b.quantidadeSugerida - a.quantidadeSugerida;
    });

  const score = Math.max(0, 100 - criticos * 12 - atencao * 4 - semLocal * 8 - prioritarios.length * 2);

  return {
    scoreInterno: score,
    classificacao: scoreClass(score),
    itensCriticos: criticos,
    itensSemLocal: semLocal,
    itensPrioritarios: prioritarios.length,
    recomendacoes: recomendacoes.slice(0, 4),
  };
}

function buildUserFromRegistration(nome: string, email: string, senha: string): User {
  const year = new Date().getFullYear();
  const idRand = Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10000;
  return {
    nome,
    email,
    senha,
    cargo: 'Farmacêutico Responsável',
    matricula: `HE-${year}-${idRand}`,
    departamento: 'Conexão de farmácia e terapêutica',
    registro: `CRF-SP ${idRand}`,
    hospital: 'HC Unicamp',
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [items, setItems] = useState<StockItem[]>(initialItems);
  const [deliveries] = useState<Delivery[]>(initialDeliveries);
  const [transfers] = useState<Transfer[]>(initialTransfers);
  const [pushAlerts, setPushAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const user = useMemo(
    () => users.find((entry) => entry.email === currentEmail) ?? null,
    [currentEmail, users],
  );

  const derivedAlerts = useMemo(() => deriveAlerts(items), [items]);
  const alerts = useMemo(() => [...pushAlerts, ...derivedAlerts], [pushAlerts, derivedAlerts]);
  const analysis = useMemo(() => deriveAnalysis(items), [items]);

  const refreshData = useCallback(() => {
    setItems((current) =>
      current.map((item) => {
        const atual = item.quantidade_atual;
        const minimo = item.quantidade_minima;
        let status: StockItem['status'];
        if (atual <= minimo * 0.3) status = 'critico';
        else if (atual <= minimo) status = 'atencao';
        else status = 'normal';
        return { ...item, status };
      }),
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const found = users.find((entry) => entry.email === email && entry.senha === password);
    if (!found) {
      setError('E-mail ou senha incorretos.');
      return false;
    }
    setCurrentEmail(found.email);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, found.email);
    } catch (err) {
      console.warn('AsyncStorage setItem error:', err);
    }
    return true;
  }, [users]);

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    setError(null);
    if (users.some((entry) => entry.email === email)) {
      setError('E-mail já cadastrado no sistema.');
      return false;
    }
    if (!Object.prototype.hasOwnProperty.call(institutionalDomains, normalizeDomain(email))) {
      setError('Domínio institucional não autorizado.');
      return false;
    }
    const created = buildUserFromRegistration(nome, email, senha);
    const nextUsers = [...users, created];
    setUsers(nextUsers);
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      await AsyncStorage.setItem(STORAGE_KEY, email);
    } catch (err) {
      console.warn('AsyncStorage setItem error:', err);
    }
    setCurrentEmail(email);
    return true;
  }, [users]);

  const confirmRegistration = useCallback(async () => {
    if (!user) return false;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, user.email);
    } catch (err) {
      console.warn('AsyncStorage setItem error:', err);
    }
    return true;
  }, [user]);

  const logout = useCallback(async () => {
    setCurrentEmail(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('AsyncStorage removeItem error:', err);
    }
  }, []);


  const addPushAlert = useCallback(
    (titulo: string, descricao: string, prioridade: AlertItem['prioridade'] = 'atencao', tipo: AlertItem['tipo'] = 'push') => {
      setPushAlerts((current) => {
        if (current.some((item) => item.titulo === titulo && item.descricao === descricao)) return current;
        return [
          {
            id: Date.now(),
            tipo,
            prioridade,
            titulo,
            descricao,
            acoes: ['Ver'],
          },
          ...current,
        ];
      });
    },
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        const storedEmail = await AsyncStorage.getItem(STORAGE_KEY);
        const storedUsers = await AsyncStorage.getItem(USERS_KEY);
        if (storedUsers) {
          try {
            setUsers(JSON.parse(storedUsers) as User[]);
          } catch {
            setUsers(initialUsers);
          }
        }
        if (storedEmail) setCurrentEmail(storedEmail);
      } catch (err) {
        console.warn('AsyncStorage error:', err);
        // Continue without AsyncStorage if there's an error
      } finally {
        setBootstrapped(true);
      }
    })();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrapped,
      authenticated: Boolean(user),
      user,
      users,
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
      recalculateStock: (itemId: number) => {
        setItems((current) =>
          current.map((item) => {
            if (item.id !== itemId) return item;
            const historico = item.historico_consumo ?? [];
            const mediaDiaria =
              historico.length === 0
                ? item.quantidade_minima
                : historico.reduce((sum, value) => sum + value, 0) / historico.length;
            const next: StockItem = {
              ...item,
              local_armazenamento: suggestLocal(item),
            };
            if (item.tipo === 'primordial') {
              next.quantidade_minima = Math.max(item.quantidade_minima, Math.ceil(mediaDiaria * 7 + mediaDiaria * 1.5));
            } else {
              next.quantidade_recomendada_ia = Math.max(item.quantidade_minima, Math.ceil(mediaDiaria * 14));
            }
            return next;
          }),
        );
      },
      addPushAlert,
    }),
    [addPushAlert, alerts, analysis, bootstrapped, confirmRegistration, deliveries, error, items, login, logout, refreshData, register, transfers, user, users],
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
