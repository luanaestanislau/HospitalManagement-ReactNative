import type { AlertItem, Delivery, StockItem, Transfer, User } from '../data/mockData';
import type {
    ApiAlertaResponse,
    ApiDashboardResponse,
    ApiItemResponse,
    ApiPedidoResponse,
    ApiPrevisaoResponse,
    ApiUsuarioResponse,
} from '../types/Api';

// ============= USUÁRIO =============
export function mapUsuario(apiUser: ApiUsuarioResponse): User {
  return {
    nome: apiUser.nome,
    email: apiUser.email,
    senha: '', 
    cargo: apiUser.cargo,
    departamento: apiUser.departamento,
    registro: apiUser.registroProfissional,
    matricula: apiUser.matricula,
    hospital: apiUser.hospital,
  };
}

// ============= ALERTAS =============
export function mapAlerta(apiAlerta: ApiAlertaResponse): AlertItem {
  let tipo: AlertItem['tipo'] = 'ia';
  if (apiAlerta.tipo === 'ESTOQUE_CRITICO') tipo = 'estoque_critico';
  else if (apiAlerta.tipo === 'VALIDADE') tipo = 'validade';
  else if (apiAlerta.tipo === 'PEDIDO_ATRASADO') tipo = 'atraso_entrega';

  let prioridade: AlertItem['prioridade'] = 'info';
  if (apiAlerta.severidade === 'CRITICA') prioridade = 'critico';
  else if (apiAlerta.severidade === 'ALTA') prioridade = 'critico';
  else if (apiAlerta.severidade === 'MEDIA') prioridade = 'atencao';
  else if (apiAlerta.severidade === 'BAIXA') prioridade = 'info';

  return {
    id: apiAlerta.id,
    tipo,
    prioridade,
    titulo: apiAlerta.titulo,
    descricao: apiAlerta.mensagem,
    item_id: apiAlerta.itemId ?? undefined,
    acoes: apiAlerta.status === 'ATIVO' ? ['Resolver', 'Ver detalhes'] : ['Ver detalhes'],
  };
}

// ============= ITENS DE ESTOQUE =============
export function mapItem(apiItem: ApiItemResponse): StockItem {
  let status: StockItem['status'] = 'normal';
  if (apiItem.status === 'CRITICO') status = 'critico';
  else if (apiItem.status === 'ATENCAO') status = 'atencao';
  else if (apiItem.status === 'VENCENDO') status = 'atencao'; 
  else if (apiItem.status === 'VENCIDO') status = 'critico'; 
  else if (apiItem.status === 'EXCESSO') status = 'atencao'; 

  let tipo: StockItem['tipo'] = 'essencial_baixa_demanda';
  if (apiItem.tipo === 'MEDICAMENTO') tipo = 'primordial';
  else if (apiItem.tipo === 'MATERIAL_CIRURGICO') tipo = 'primordial';

  return {
    id: apiItem.id,
    nome: apiItem.nome,
    tipo,
    categoria: apiItem.categoria,
    quantidade_atual: apiItem.quantidadeAtual,
    quantidade_minima: apiItem.quantidadeMinima,
    quantidade_recomendada_ia: apiItem.quantidadeRecomendadaIa ?? undefined,
    status,
    local_armazenamento: apiItem.localArmazenamento || null,
    historico_consumo: [], 
  };
}

// ============= PEDIDOS (DELIVERIES) =============
export function mapPedido(apiPedido: ApiPedidoResponse): Delivery {
  let status: Delivery['status'] = 'em_rota';
  if (apiPedido.slaExcedido || apiPedido.status === 'OCORRENCIA') status = 'atrasado';
  else if (apiPedido.status === 'ENTREGUE') status = 'entregue';
  else if (apiPedido.status === 'CANCELADO') status = 'nao_entregue';
  else if (apiPedido.status === 'EM_TRANSITO') status = 'em_rota';

  return {
    id: apiPedido.id,
    codigo: apiPedido.codigo,
    fornecedor: 'Fornecedor', 
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

// ============= PREVISÃO =============
// ⚠️ Alinhado ao types/Api.ts atual (demandaProjetada/sugestaoCompra/serie).
// Se o backend real devolver historico/previsao/recomendacao/fatoresConsiderados
// (como em PrevisaoResponse.java visto anteriormente), este mapper vai
// produzir campos undefined em silêncio — confirme o JSON real do endpoint
// antes de confiar nesta função em produção.
export type PrevisaoView = {
  itemId: string;
  demandaProjetada: number;
  diasProjetados: number;
  mediaMovelSimples: number;
  sugestaoCompra: number;
  confianca: number;
  serie: Array<{ data: string; valor: number }>;
};

export function mapPrevisao(apiPrevisao: ApiPrevisaoResponse): PrevisaoView {
  return {
    itemId: apiPrevisao.itemId,
    demandaProjetada: apiPrevisao.demandaProjetada,
    diasProjetados: apiPrevisao.diasProjetados,
    mediaMovelSimples: apiPrevisao.mediaMovelSimples,
    sugestaoCompra: apiPrevisao.sugestaoCompra,
    confianca: apiPrevisao.confianca,
    serie: apiPrevisao.serie,
  };
}

export function createMockTransfers(): Transfer[] {
  return [
    {
      id: '1',
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