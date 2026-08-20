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
  'fiap.com.br': 'FIAP',
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

export type Fornecedor = {
  id: number;
  nome: string;
  cnpj: string;
  contato: string;
  score_confiabilidade: number;
  historico_atrasos: number;
};

export type HospitalParceiro = {
  id: number;
  nome: string;
  cidade: string;
  latitude: number;
  longitude: number;
  contato: string;
};

export type EventoRisco = {
  id: number;
  tipo: string;
  descricao: string;
  data_inicio: string;
  data_fim?: string;
  status: 'ativo' | 'resolvido';
  prejuizo_real?: number;
  acoes_executadas?: string[];
};

export type CasoClinico = {
  id: number;
  especialidade: 'oncologia' | 'cardiologia' | 'neurologia' | 'emergencia' | 'outro';
  descricao: string;
  item_id: number;
  quantidade_necessaria: number;
  custo_estimado: number;
  prioridade: 'alta' | 'media' | 'baixa';
  frequencia_anual: number;
};

// Dados iniciais
export const initialFornecedores: Fornecedor[] = [
  {
    id: 1,
    nome: 'ForneceMed',
    cnpj: '00.000.000/0001-10',
    contato: 'contato@fornecemed.com',
    score_confiabilidade: 82,
    historico_atrasos: 3,
  },
  {
    id: 2,
    nome: 'MediSupply',
    cnpj: '00.000.000/0001-20',
    contato: 'suporte@medisupply.com',
    score_confiabilidade: 94,
    historico_atrasos: 1,
  },
  {
    id: 3,
    nome: 'PharmaExpress',
    cnpj: '00.000.000/0001-30',
    contato: 'vendas@pharmaexpress.com',
    score_confiabilidade: 78,
    historico_atrasos: 5,
  },
];

export const initialHospitaisParceiros: HospitalParceiro[] = [
  {
    id: 1,
    nome: 'HC Unicamp',
    cidade: 'Campinas',
    latitude: -22.821,
    longitude: -47.064,
    contato: '(19) 3521-7000',
  },
  {
    id: 2,
    nome: 'Santa Casa de Campinas',
    cidade: 'Campinas',
    latitude: -22.903,
    longitude: -47.062,
    contato: '(19) 3756-6000',
  },
  {
    id: 3,
    nome: 'Hospital Mário Gatti',
    cidade: 'Campinas',
    latitude: -22.886,
    longitude: -47.046,
    contato: '(19) 3772-5700',
  },
];

export const initialEventosRisco: EventoRisco[] = [
  {
    id: 1,
    tipo: 'atraso_entrega',
    descricao: 'Atraso logístico no fornecedor ForneceMed',
    data_inicio: new Date().toISOString(),
    status: 'ativo',
    prejuizo_real: 5000,
  },
  {
    id: 2,
    tipo: 'extravio_reembolso',
    descricao: 'Extravio durante transferência entre CDs',
    data_inicio: new Date().toISOString(),
    status: 'ativo',
    prejuizo_real: 30000,
  },
];

export const initialCasosClinicos: CasoClinico[] = [
  {
    id: 1,
    especialidade: 'oncologia',
    descricao: 'Melanoma metastático stage IV - tratamento imunoterápico',
    item_id: 4,
    quantidade_necessaria: 4,
    custo_estimado: 42000,
    prioridade: 'alta',
    frequencia_anual: 12,
  },
  {
    id: 2,
    especialidade: 'neurologia',
    descricao: 'AVC isquêmico agudo < 4.5h - candidato trombólise',
    item_id: 5,
    quantidade_necessaria: 1,
    custo_estimado: 15000,
    prioridade: 'alta',
    frequencia_anual: 48,
  },
];
