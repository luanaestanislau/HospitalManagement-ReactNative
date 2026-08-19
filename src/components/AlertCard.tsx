import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, BadgeVariant } from './Badge';
import { colors } from '../theme/colors';

export type AlertAction = {
  label: string;
  primary?: boolean;
  onPress?: () => void;
};

export function AlertCard({
  title,
  description,
  variant,
  badgeLabel,
  actions = [],
  progress,
}: {
  title: string;
  description: string;
  variant: BadgeVariant;
  badgeLabel: string;
  actions?: AlertAction[];
  progress?: number | null;
}) {
  const palette = {
    critico: { bg: '#FCEBEB', border: '#F7C1C1', dot: colors.danger },
    atencao: { bg: '#FAEEDA', border: '#FAC775', dot: colors.warning },
    normal: { bg: '#EAF3DE', border: '#C0DD97', dot: colors.success },
    info: { bg: '#E6F1FB', border: '#B5D4F4', dot: colors.info },
    ia: { bg: '#EEEDFE', border: '#AFA9EC', dot: colors.primary },
    coral: { bg: '#FAECE7', border: '#F0997B', dot: colors.coral },
  }[variant];

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: palette.dot }]} />
        <Text style={styles.title}>{title}</Text>
        <Badge label={badgeLabel} variant={variant} />
      </View>
      <Text style={styles.description}>{description}</Text>
      {typeof progress === 'number' ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%`, backgroundColor: palette.dot }]} />
        </View>
      ) : null}
      {actions.length ? (
        <View style={styles.actionsRow}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={[styles.action, action.primary ? styles.actionPrimary : styles.actionSecondary]}
            >
              <Text style={[styles.actionText, action.primary ? styles.actionTextPrimary : styles.actionTextSecondary]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    color: '#374151',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  action: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionTextPrimary: {
    color: '#FFFFFF',
  },
  actionTextSecondary: {
    color: '#111827',
  },
});

