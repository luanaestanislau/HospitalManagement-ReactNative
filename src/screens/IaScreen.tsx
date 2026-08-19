import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, AiBadge } from '../components/Badge';
import { ScoreBar } from '../components/ScoreBar';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export function IaScreen() {
  const { analysis } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>IA</Text>
        <AiBadge />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Análise interna</Text>
        <Text style={styles.bigScore}>{analysis.scoreInterno}/100</Text>
        <ScoreBar score={analysis.scoreInterno} />
        <Text style={styles.caption}>{analysis.classificacao}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{analysis.itensCriticos}</Text>
          <Text style={styles.statLabel}>Críticos</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{analysis.itensSemLocal}</Text>
          <Text style={styles.statLabel}>Sem local</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{analysis.itensPrioritarios}</Text>
          <Text style={styles.statLabel}>Prioritários</Text>
        </View>
      </View>

      {analysis.recomendacoes.map((item) => (
        <View key={item.item} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{item.item}</Text>
            <Badge label={item.prioridade.toUpperCase()} variant={item.prioridade === 'alta' ? 'critico' : 'atencao'} />
          </View>
          <Text style={styles.cardText}>Atual: {item.localAtual}</Text>
          <Text style={styles.cardText}>Sugerido: {item.localSugerido}</Text>
          <Text style={styles.cardText}>Qtd sugerida: {item.quantidadeSugerida}</Text>
          <Text style={styles.cardText}>Tempo estimado: {item.tempoTransferencia} min</Text>
          <Text style={styles.cardText}>{item.motivo}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 12,
  },
  cardTitle: { color: colors.text, fontWeight: '600', fontSize: 14 },
  bigScore: { color: colors.warning, fontSize: 34, fontWeight: '700', marginVertical: 6 },
  caption: { marginTop: 6, color: colors.muted },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111827' },
  statLabel: { color: '#64748B', fontSize: 11 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardText: { color: colors.muted, marginTop: 4, fontSize: 12 },
});