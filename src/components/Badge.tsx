import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export type BadgeVariant = 'critico' | 'atencao' | 'normal' | 'info' | 'ia' | 'coral';

const variantMap: Record<BadgeVariant, { bg: string; fg: string }> = {
  critico: { bg: '#F7C1C1', fg: '#501313' },
  atencao: { bg: '#FAC775', fg: '#412402' },
  normal: { bg: '#C0DD97', fg: '#173404' },
  info: { bg: '#B5D4F4', fg: '#0C447C' },
  ia: { bg: '#EEEDFE', fg: '#26215C' },
  coral: { bg: '#FAECE7', fg: '#4A1B0C' },
};

export function Badge({
  label,
  variant = 'info',
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const palette = variantMap[variant];
  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function AiBadge() {
  return <Badge label="IA" variant="ia" />;
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.divider} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
  },
});

