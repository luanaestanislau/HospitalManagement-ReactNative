import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, SectionDivider } from '../components/Badge';
import { ScoreBar } from '../components/ScoreBar';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export function EstoqueScreen() {
  const { items, recalculateStock } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estoque</Text>
        <Badge label={`${items.filter((item) => item.status === 'critico').length} críticos`} variant="critico" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionDivider label="Itens prioritários" />
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemMeta}>
                  Atual: {item.quantidade_atual} · Mín: {item.quantidade_minima}
                </Text>
              </View>
              <Badge
                label={item.status === 'critico' ? 'CRÍTICO' : item.status === 'atencao' ? 'ATENÇÃO' : 'NORMAL'}
                variant={item.status === 'critico' ? 'critico' : item.status === 'atencao' ? 'atencao' : 'normal'}
              />
            </View>
            <View style={styles.spacing} />
            <ScoreBar score={item.quantidade_atual} max={item.quantidade_minima * 3} />
            <Text style={styles.local}>Local: {item.local_armazenamento ?? 'Não definido'}</Text>
            <Pressable onPress={() => recalculateStock(item.id)} style={styles.button}>
              <Text style={styles.buttonText}>Recalcular</Text>
            </Pressable>
          </View>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  itemMeta: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
  },
  spacing: {
    height: 8,
  },
  local: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 12,
  },
  button: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.primarySoftBg,
    fontWeight: '600',
  },
});

