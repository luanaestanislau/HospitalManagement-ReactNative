import type { AlertItem, Delivery, StockItem, Transfer, User } from '../data/mockData';
import type {
    ApiAlertaResponse,
    ApiDashboardResponse,
    ApiItemResponse,
    ApiPedidoResponse,
    ApiUsuarioResponse,
} from '../types/Api';

// ============= USUÁRIO =============
export function mapUsuario(apiUser: ApiUsuarioResponse): User {
  return {
    nome: apiUser.nome,
    email: apiUser.email,
    senha: '', // Senha não vem da API
    cargo: apiUser.cargo,
    departamento: apiUser.departamento,
    registro: apiUser.registroProfissional,
    matricula: apiUser.matricula,
    hospital: apiUser.hospital,
  };
}

// ============= ALERTAS =============
export function mapAlerta(apiAlerta: ApiAlertaResponse): AlertItem {
  // Mapear tipo do alerta
  let tipo: AlertItem['tipo'] = 'ia';
  if (apiAlerta.tipo === 'ESTOQUE_CRITICO') tipo = 'estoque_critico';
  else if (apiAlerta.tipo === 'VALIDADE') tipo = 'validade';
  else if (apiAlerta.tipo === 'PEDIDO_ATRASADO') tipo = 'atraso_entrega';

  // Mapear prioridade
  let prioridade: AlertItem['prioridade'] = 'info';
  if (apiAlerta.severidade === 'CRITICA') prioridade = 'critico';
  else if (apiAlerta.severidade === 'ALTA') prioridade = 'critico';
  else if (apiAlerta.severidade === 'MEDIA') prioridade = 'atencao';
  else if (apiAlerta.severidade === 'BAIXA') prioridade = 'info';

  return {
    id: parseInt(apiAlerta.id, 10) || 0,
    tipo,
    prioridade,
    titulo: apiAlerta.titulo,
    descricao: apiAlerta.mensagem,
    item_id: apiAlerta.itemId ? parseInt(apiAlerta.itemId, 10) : undefined,
    acoes: apiAlerta.status === 'ATIVO' ? ['Resolver', 'Ver detalhes'] : ['Ver detalhes'],
  };
}

// ============= ITENS DE ESTOQUE =============
export function mapItem(apiItem: ApiItemResponse): StockItem {
  // Mapear status
  let status: StockItem['status'] = 'normal';
  if (apiItem.status === 'CRITICO') status = 'critico';
  else if (apiItem.status === 'ATENCAO') status = 'atencao';
  else if (apiItem.status === 'VENCENDO') status = 'atencao'; // Mapear vencendo para atencao
  else if (apiItem.status === 'VENCIDO') status = 'critico'; // Mapear vencido para critico

  // Mapear tipo
  let tipo: StockItem['tipo'] = 'essencial_baixa_demanda';
  if (apiItem.tipo === 'MEDICAMENTO') tipo = 'primordial';
  else if (apiItem.tipo === 'MATERIAL_CIRURGICO') tipo = 'primordial';

  return {
    id: parseInt(apiItem.id, 10) || 0,
    nome: apiItem.nome,
    tipo,
    categoria: apiItem.categoria,
    quantidade_atual: apiItem.quantidadeAtual,
    quantidade_minima: apiItem.quantidadeMinima,
    quantidade_recomendada_ia: apiItem.quantidadeRecomendadaIa || undefined,
    status,
    local_armazenamento: apiItem.localArmazenamento || null,
    historico_consumo: [], // Histórico não vem da API ainda
  };
}

// ============= PEDIDOS (DELIVERIES) =============
export function mapPedido(apiPedido: ApiPedidoResponse): Delivery {
  // Mapear status
  let status: Delivery['status'] = 'em_rota';
  if (apiPedido.slaExcedido || apiPedido.status === 'OCORRENCIA') status = 'atrasado';
  else if (apiPedido.status === 'ENTREGUE') status = 'entregue';
  else if (apiPedido.status === 'CANCELADO') status = 'nao_entregue';
  else if (apiPedido.status === 'EM_TRANSITO') status = 'em_rota';

  return {
    id: parseInt(apiPedido.id, 10) || 0,
    codigo: apiPedido.codigo,
    fornecedor: 'Fornecedor', // Nome do fornecedor virá de outra chamada
    status,
    eta: apiPedido.etaPrevista,
    hora_entrega: apiPedido.dataEntrega || undefined,
    valor_total: apiPedido.valorTotal,
    motivo_ocorrencia: apiPedido.motivoOcorrencia || undefined,
    valor_reembolso: apiPedido.valorReembolso || undefined,
    item: apiPedido.itens.length > 0 ? `${apiPedido.itens.length} itens` : 'Sem itens',
    sugerida_por_ia: false,
  };
}

// ============= DASHBOARD =============
export function mapDashboard(apiDashboard: ApiDashboardResponse) {
  return {
    estoque: apiDashboard.estoque,
    alertas: apiDashboard.alertasRecentes.map(mapAlerta),
    pedidos: apiDashboard.pedidosDoDia.map(mapPedido),
    geradoEm: apiDashboard.geradoEm,
  };
}

// ============= TRANSFERS (mock - backend não tem ainda) =============
export function createMockTransfers(): Transfer[] {
  return [
    {
      id: 1,
      origem: 'Almoxarifado Central',
      destino: 'Farmácia do 3º andar',
      item: 'Soro Fisiológico 500ml',
      quantidade: 50,
      urgencia: 'alta',
      status: 'pendente',
      sugerida_por_ia: true,
    },
  ];
}
