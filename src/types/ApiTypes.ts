export interface UsuarioResponse {
  id: number;
  primeiroNome: string;
  ultimoNome: string;
  emailInstitucional: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  expiraEmMinutos: number;
  usuario: UsuarioResponse;
}

export interface MatriculaResponse {
  nomeCompleto: string;
  matricula: string;
  departamento: string;
  cargo: string;
  registroProfissional: string;
  perfil: string;
  hospital: string;
}

export interface ItemEstoqueResponse {
  id: number;
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidadeMedida: string;
  localArmazenamento: string;
  hospitalId: number;
  hospitalNome: string;
  validade: string;
  custoUnitario: number;
  altoCustoBaixaDemanda: boolean;
  nivel: 'NORMAL' | 'ATENCAO' | 'CRITICO';
  vencido: boolean;
  validadeProxima: boolean;
  diasParaVencer: number;
  percentualEstoque: number;
}

export interface AlertaResponse {
  itemEstoqueId: number;
  itemNome: string;
  tipo: 'CRITICO' | 'ATENCAO' | 'INFO';
  mensagem: string;
  hospitalNome: string;
  localArmazenamento: string;
}

export interface EntregaResponse {
  id: number;
  itemNome: string;
  hospitalDestinoNome: string;
  quantidade: number;
  status: 'PENDENTE' | 'EM_ROTA' | 'CONCLUIDA' | 'CANCELADA' | 'ATRASADO';
  dataPrevista: string;
  transportadora: string;
}

export interface TransferenciaResponse {
  id: number;
  itemNome: string;
  hospitalOrigemNome: string;
  hospitalDestinoNome: string;
  quantidade: number;
  status: 'PENDENTE' | 'EM_ROTA' | 'CONCLUIDA' | 'CANCELADA';
  distanciaKm: number;
  tempoEstimadoMinutos: number;
  motivo: string;
  geradoPorIa: boolean;
}

export interface InsightItemResponse {
  itemEstoqueId: number;
  itemNome: string;
  hospitalNome: string;
  demandaProjetadaUnidades: number;
  demandaProjetadaDias: number;
  mediaMovelSimples: number;
  sugestaoCompraUnidades: number;
  confiancaPercentual: number;
}

export interface AnaliseInternaResponse {
  scoreOtimizacao: number;
  classificacao: string;
  itensCriticos: number;
  itensPrioritarios: number;
  previsoesGeradas: number;
  insights: InsightItemResponse[];
}