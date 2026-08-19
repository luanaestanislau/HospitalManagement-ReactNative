export type User = {
  nome: string;
  email: string;
  senha: string;
  cargo: string;
  matricula: string;
  departamento: string;
  registro: string;
  hospital: string;
};

export type StockItem = {
  id: number;
  nome: string;
  tipo: 'primordial' | 'essencial_baixa_demanda';
  categoria?: string;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_recomendada_ia?: number;
  status: 'critico' | 'atencao' | 'normal';
  local_armazenamento: string | null;
  historico_consumo?: number[];
};

export type AlertItem = {
  id: number;
  tipo: 'estoque_critico' | 'validade' | 'atraso_entrega' | 'push' | 'ia';
  prioridade: 'critico' | 'atencao' | 'info';
  titulo: string;
  descricao: string;
  item_id?: number;
  acoes: string[];
};

export type Delivery = {
  id: number;
  codigo: string;
  fornecedor: string;
  status: 'atrasado' | 'em_rota' | 'extravio_reembolso' | 'nao_entregue' | 'entregue';
  eta?: string;
  hora_entrega?: string;
  valor_total: number;
  motivo_ocorrencia?: string;
  valor_reembolso?: number;
  item: string;
  sugerida_por_ia?: boolean;
};

export type Transfer = {
  id: number;
  origem: string;
  destino: string;
  item: string;
  quantidade: number;
  urgencia: string;
  status: string;
  sugerida_por_ia: boolean;
};

export const institutionalDomains = {
  'hc.unicamp.br': 'Hospital das Clínicas — Unicamp',
  'hc.usp.br': 'Hospital das Clínicas — USP',
  'einstein.br': 'Hospital Albert Einstein',
  'hospital.gov.br': 'Hospital Federal',
  'saude.sp.gov.br': 'Secretaria de Saúde — SP',
} as const;

export const initialUsers: User[] = [
  {
    nome: 'Ana Souza',
    email: 'ana@hc.unicamp.br',
    senha: '123456',
    cargo: 'Farmacêutica Responsável',
    matricula: 'HE-2026-1024',
    departamento: 'Conexão de farmácia e terapêutica',
    registro: 'CRF-SP 1024',
    hospital: 'HC Unicamp',
  },
];

export const initialItems: StockItem[] = [
  {
    id: 1,
    nome: 'Soro Fisiológico 500ml',
    tipo: 'primordial',
    quantidade_atual: 18,
    quantidade_minima: 100,
    status: 'critico',
    local_armazenamento: 'Farmácia Central A1',
    historico_consumo: [12, 14, 15, 13, 16, 17, 18],
  },
  {
    id: 2,
    nome: 'Seringa 10ml',
    tipo: 'primordial',
    quantidade_atual: 340,
    quantidade_minima: 200,
    status: 'atencao',
    local_armazenamento: 'Almoxarifado Norte',
    historico_consumo: [22, 21, 23, 25, 24, 22, 26],
  },
  {
    id: 3,
    nome: 'Luva Estéril S',
    tipo: 'primordial',
    quantidade_atual: 820,
    quantidade_minima: 100,
    status: 'normal',
    local_armazenamento: 'Almoxarifado Norte',
    historico_consumo: [6, 7, 5, 8, 6, 7, 6],
  },
  {
    id: 4,
    nome: 'Epinefrina 1mg/ml',
    tipo: 'essencial_baixa_demanda',
    quantidade_atual: 8,
    quantidade_minima: 5,
    quantidade_recomendada_ia: 22,
    status: 'atencao',
    local_armazenamento: 'Farmácia Central B2',
    historico_consumo: [1, 0, 2, 1, 1, 1, 1],
  },
  {
    id: 5,
    nome: 'Morfina 10mg/ml',
    tipo: 'essencial_baixa_demanda',
    quantidade_atual: 5,
    quantidade_minima: 3,
    quantidade_recomendada_ia: 15,
    status: 'atencao',
    local_armazenamento: null,
    historico_consumo: [1, 1, 1, 0, 1, 1, 1],
  },
];

export const initialDeliveries: Delivery[] = [
  {
    id: 38,
    codigo: '#OG038',
    fornecedor: 'ForneceMed',
    status: 'atrasado',
    eta: '12h00',
    valor_total: 45000,
    item: 'Soro Fisiológico 500ml',
  },
  {
    id: 41,
    codigo: '#OG041',
    fornecedor: 'MediSupply',
    status: 'em_rota',
    eta: '16h30',
    valor_total: 32000,
    item: 'Seringa 5ml · 500 un',
  },
  {
    id: 48,
    codigo: '#OG048',
    fornecedor: 'ForneceMed',
    status: 'extravio_reembolso',
    eta: 'reentrega em 48h',
    valor_total: 30000,
    motivo_ocorrencia: 'Extravio confirmado em auditoria de rota',
    valor_reembolso: 30000,
    item: 'Daptomicina 500mg · 4 frascos',
  },
  {
    id: 49,
    codigo: '#OG049',
    fornecedor: 'PharmaExpress',
    status: 'nao_entregue',
    eta: '--',
    valor_total: 180000,
    motivo_ocorrencia: 'Nao entregue apos tentativas de reprogramacao',
    valor_reembolso: 0,
    item: 'Eculizumab 300mg · 1 frasco',
  },
  {
    id: 39,
    codigo: '#OG039',
    fornecedor: 'ForneceMed',
    status: 'entregue',
    hora_entrega: '13h44',
    valor_total: 9800,
    item: 'Luva Estéril P · 200 cx',
  },
];

export const initialTransfers: Transfer[] = [
  {
    id: 1,
    origem: 'Santa Casa – Campinas',
    destino: 'HC Unicamp',
    item: 'Morfina 10mg/ml',
    quantidade: 18,
    urgencia: 'imediata',
    status: 'pendente',
    sugerida_por_ia: true,
  },
  {
    id: 2,
    origem: 'HC Unicamp',
    destino: 'Santa Casa – Campinas',
    item: 'Epinefrina 1mg/ml',
    quantidade: 10,
    urgencia: 'preventiva',
    status: 'pendente',
    sugerida_por_ia: true,
  },
];

