import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AlertCard } from '../components/AlertCard';
import { Badge } from '../components/Badge';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export function AlertasScreen() {
  const { alerts } = useApp();
  const [filter, setFilter] = useState<'todos' | 'critico' | 'atencao' | 'info'>('todos');
  const filters: Array<{ key: typeof filter; label: string; count: number; variant: 'info' | 'critico' | 'atencao' }> = [
    { key: 'todos', label: 'Todos', count: alerts.length, variant: 'info' },
    { key: 'critico', label: 'Críticos', count: alerts.filter((item) => item.prioridade === 'critico').length, variant: 'critico' },
    { key: 'atencao', label: 'Atenção', count: alerts.filter((item) => item.prioridade === 'atencao').length, variant: 'atencao' },
    { key: 'info', label: 'Info', count: 0, variant: 'info' },
  ];

  const filtered = alerts.filter((alert) => {
    if (filter === 'todos') return true;
    return alert.prioridade === filter;
  });
  const criticalCount = filters[1].count;
  const attentionCount = filters[2].count;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertas</Text>
        {criticalCount > 0 ? <Badge label={`${criticalCount} críticos`} variant="critico" /> : null}
      </View>

      <View style={styles.filters}>
        {filters.map(({ key, label, count, variant }) => {
          const active = filter === key;
          return (
            <Pressable key={key} onPress={() => setFilter(key)} style={[styles.filterChip, active && styles.filterChipActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
              {count > 0 ? (
                <View style={[styles.filterCount, active && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>{count}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>
              {filter === 'todos' ? 'Nenhum alerta ativo' : 'Nenhum alerta nesta categoria'}
            </Text>
          </View>
        ) : (
          filtered.map((alert) => (
            <AlertCard
              key={`${alert.tipo}-${alert.id}`}
              title={alert.titulo}
              description={alert.descricao}
              variant={alert.prioridade === 'critico' ? 'critico' : alert.prioridade === 'atencao' ? 'atencao' : 'info'}
              badgeLabel={alert.tipo === 'estoque_critico' ? 'CRÍTICO' : alert.tipo === 'validade' ? 'VALIDADE' : alert.tipo === 'atraso_entrega' ? 'LOGÍSTICA' : 'AVISO'}
              actions={alert.acoes.map((action) => ({ label: action, primary: action === 'Repor' }))}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  filters: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.muted,
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.primarySoftBg,
    fontWeight: '500',
  },
  filterCount: {
    marginTop: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  filterCountActive: {
    backgroundColor: colors.primary,
  },
  filterCountText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '500',
  },
  filterCountTextActive: {
    color: colors.text,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    marginTop: 12,
    color: colors.muted,
  },
});
