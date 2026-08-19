import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, SectionDivider } from '../components/Badge';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export function LogisticaScreen() {
  const { deliveries, transfers } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Logística</Text>
        <Badge label={`${deliveries.filter((item) => item.status === 'em_rota').length} em rota`} variant="info" />
      </View>

      <SectionDivider label="Entregas" />
      {deliveries.map((delivery) => (
        <View key={delivery.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{delivery.codigo}</Text>
            <Badge
              label={
                delivery.status === 'atrasado'
                  ? 'ATRASADO'
                  : delivery.status === 'em_rota'
                    ? 'EM ROTA'
                    : delivery.status === 'extravio_reembolso'
                      ? 'EXTRAVIO'
                      : delivery.status === 'nao_entregue'
                        ? 'NÃO ENTREGUE'
                        : 'ENTREGUE'
              }
              variant={delivery.status === 'entregue' ? 'normal' : delivery.status === 'em_rota' ? 'info' : 'critico'}
            />
          </View>
          <Text style={styles.cardText}>Fornecedor: {delivery.fornecedor}</Text>
          <Text style={styles.cardText}>Item: {delivery.item}</Text>
          <Text style={styles.cardText}>ETA: {delivery.eta ?? delivery.hora_entrega ?? '--'}</Text>
          {delivery.motivo_ocorrencia ? <Text style={styles.cardText}>{delivery.motivo_ocorrencia}</Text> : null}
        </View>
      ))}

      <SectionDivider label="Transferências" />
      {transfers.map((transfer) => (
        <View key={transfer.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{transfer.item}</Text>
            <Badge label={transfer.urgencia.toUpperCase()} variant={transfer.sugerida_por_ia ? 'ia' : 'info'} />
          </View>
          <Text style={styles.cardText}>Origem: {transfer.origem}</Text>
          <Text style={styles.cardText}>Destino: {transfer.destino}</Text>
          <Text style={styles.cardText}>Qtd: {transfer.quantidade}</Text>
          <Text style={styles.cardText}>Status: {transfer.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  cardText: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
  },
});

