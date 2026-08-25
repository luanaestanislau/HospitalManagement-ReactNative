import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AiBadge, Badge } from '../components/Badge';
import { ScoreBar } from '../components/ScoreBar';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export function IaScreen() {
  const { analysis, items } = useApp();

  const nomeDoItem = (itemId: string) => items.find((item) => item.id === itemId)?.nome ?? itemId;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
            <Text style={styles.statValue}>{analysis.itensPrioritarios}</Text>
            <Text style={styles.statLabel}>Prioritários</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{analysis.previsoes.length}</Text>
            <Text style={styles.statLabel}>Previsões geradas</Text>
          </View>
        </View>

        {analysis.previsoes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma previsão de IA disponível no momento.</Text>
          </View>
        ) : (
          analysis.previsoes.map((previsao) => {
            const confiancaPct = Math.round((previsao.confianca ?? 0) * 100);
            return (
              <View key={previsao.itemId} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle}>{nomeDoItem(previsao.itemId)}</Text>
                  <Badge
                    label={`${confiancaPct}% confiança`}
                    variant={confiancaPct >= 70 ? 'normal' : confiancaPct >= 40 ? 'atencao' : 'critico'}
                  />
                </View>
                <Text style={styles.cardText}>
                  Demanda projetada: {previsao.demandaProjetada} un. em {previsao.diasProjetados} dias
                </Text>
                <Text style={styles.cardText}>Média móvel simples: {previsao.mediaMovelSimples}</Text>
                <Text style={[styles.cardText, { color: colors.warning }]}>
                  Sugestão de compra: {previsao.sugestaoCompra} un.
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
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
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: colors.muted, fontSize: 12 },
});