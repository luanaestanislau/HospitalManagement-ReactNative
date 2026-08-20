// ============= AUTH =============
export type ApiTokenResponse = {
  token: string;
  tipo: string;
  expiraEm: string;
  usuario: ApiUsuarioResponse;
};

export type ApiUsuarioResponse = {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  departamento: string;
  cargo: string;
  registroProfissional: string;
  hospital: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
};

export type PerfilUsuario = 'ADMIN' | 'GESTOR' | 'FARMACEUTICO' | 'ENFERMEIRO';

// ============= DASHBOARD =============
export type ApiDashboardResponse = {
  geradoEm: string;
  estoque: ApiResumoEstoqueResponse;
  pedidosDoDia: ApiPedidoResponse[];
  alertasRecentes: ApiAlertaResponse[];
};

export type ApiResumoEstoqueResponse = {
  total: number;
  criticos: number;
  atencao: number;
  normais: number;
  vencendo: number;
};

// ============= ITENS =============
export type ApiItemResponse = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  unidadeMedida: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  quantidadeMaxima: number;
  quantidadeRecomendadaIa: number | null;
  localArmazenamento: string;
  fornecedorId: string;
  tipo: TipoItem;
  lote: string;
  dataValidade: string;
  status: StatusItem;
  criadoEm: string;
  atualizadoEm: string;
};

export type TipoItem = 'MEDICAMENTO' | 'MATERIAL_CIRURGICO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO';
export type StatusItem = 'CRITICO' | 'ATENCAO' | 'NORMAL' | 'EXCESSO' | 'VENCENDO' | 'VENCIDO';

export type ApiPaginaResponse<T> = {
  conteudo: T[];
  paginaAtual: number;
  tamanhoPagina: number;
  totalElementos: number;
  totalPaginas: number;
};

// ============= ALERTAS =============
export type ApiAlertaResponse = {
  id: string;
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  titulo: string;
  mensagem: string;
  itemId: string | null;
  pedidoId: string | null;
  status: StatusAlerta;
  acaoTomada: string | null;
  criadoEm: string;
  resolvidoEm: string | null;
};

export type TipoAlerta = 'ESTOQUE_CRITICO' | 'VALIDADE' | 'PEDIDO_ATRASADO' | 'QUALIDADE' | 'OUTRO';
export type SeveridadeAlerta = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type StatusAlerta = 'ATIVO' | 'RESOLVIDO' | 'IGNORADO';

// ============= PEDIDOS =============
export type ApiPedidoResponse = {
  id: string;
  codigo: string;
  fornecedorId: string;
  status: StatusPedido;
  dataPedido: string;
  etaPrevista: string;
  dataEntrega: string | null;
  reentregaPrevistaEm: string | null;
  slaHoras: number;
  valorTotal: number;
  valorReembolso: number | null;
  motivoAtraso: string | null;
  motivoOcorrencia: string | null;
  itens: ApiItemPedidoResponse[];
  slaExcedido: boolean;
};

export type ApiItemPedidoResponse = {
  itemId: string;
  quantidade: number;
  precoUnitario: number;
};

export type StatusPedido = 'PENDENTE' | 'APROVADO' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADO' | 'OCORRENCIA';

// ============= FORNECEDOR =============
export type ApiFornecedorResponse = {
  id: string;
  nome: string;
  cnpj: string;
  contato: string;
  email: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
  criadoEm: string;
};

// ============= PREVISÃO =============
export type ApiPrevisaoResponse = {
  id: string;
  itemId: string;
  demandaProjetada: number;
  diasProjetados: number;
  mediaMovelSimples: number;
  sugestaoCompra: number;
  confianca: number;
  geradoEm: string;
  serie: ApiPontoSerieResponse[];
};

export type ApiPontoSerieResponse = {
  data: string;
  valor: number;
};
