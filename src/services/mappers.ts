import {
  AlertaResponse,
  AnaliseInternaResponse,
  EntregaResponse,
  ItemEstoqueResponse,
  TransferenciaResponse,
} from '../types/ApiTypes';

export function mapItemEstoqueToUi(item: ItemEstoqueResponse) {
  return {
    id: String(item.id),
    nome: item.nome,
    quantidade_atual: item.quantidadeAtual,
    quantidade_minima: item.quantidadeMinima,
    local_armazenamento: item.localArmazenamento,
    status: item.nivel.toLowerCase() as 'normal' | 'atencao' | 'critico',
    tipo: item.altoCustoBaixaDemanda ? 'essencial_baixa_demanda' : 'comum',
    hospitalNome: item.hospitalNome,
  };
}

export function mapAlertaToUi(alerta: AlertaResponse, index: number) {
  const prioridade = alerta.tipo.toLowerCase() as 'critico' | 'atencao' | 'info';
  return {
    id: `${alerta.itemEstoqueId || 'alerta'}-${index}`,
    tipo: prioridade === 'critico' ? 'estoque_critico' : 'aviso',
    titulo: `${alerta.hospitalNome || 'Estoque'} - ${alerta.itemNome}`,
    descricao: alerta.mensagem,
    prioridade,
    acoes: prioridade === 'critico' ? ['Repor', 'Verificar'] : ['Detalhes'],
  };
}

export function mapEntregaToUi(entrega: EntregaResponse) {
  return {
    id: String(entrega.id),
    codigo: `ENT-${entrega.id}`,
    fornecedor: entrega.transportadora || 'Transportadora Padrão',
    item: entrega.itemNome,
    eta: entrega.dataPrevista,
    status: entrega.status.toLowerCase().replace('_', '_'),
  };
}

export function mapTransferenciaToUi(transferencia: TransferenciaResponse) {
  return {
    id: String(transferencia.id),
    item: transferencia.itemNome,
    origem: transferencia.hospitalOrigemNome,
    destino: transferencia.hospitalDestinoNome,
    quantidade: transferencia.quantidade,
    status: transferencia.status.toLowerCase(),
    urgencia: transferencia.geradoPorIa ? 'alta' : 'media',
    sugerida_por_ia: transferencia.geradoPorIa,
  };
}

export function mapAnaliseToUi(analise: AnaliseInternaResponse) {
  return {
    scoreInterno: analise.scoreOtimizacao,
    classificacao: analise.classificacao,
    itensCriticos: analise.itensCriticos,
    itensPrioritarios: analise.itensPrioritarios,
    previsoes: analise.insights.map((insight) => ({
      itemId: String(insight.itemEstoqueId),
      demandaProjetada: insight.demandaProjetadaUnidades,
      diasProjetados: insight.demandaProjetadaDias,
      mediaMovelSimples: insight.mediaMovelSimples,
      sugestaoCompra: insight.sugestaoCompraUnidades,
      confianca: insight.confiancaPercentual / 100,
    })),
  };
}
