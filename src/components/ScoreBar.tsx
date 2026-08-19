import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

export function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const progress = max === 0 ? 0 : Math.max(0, Math.min(1, score / max));
  const barColor = progress >= 0.8 ? colors.success : progress >= 0.6 ? colors.warning : colors.danger;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: barColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

