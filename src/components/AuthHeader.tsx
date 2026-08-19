import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export function AuthHeader({
  icon,
  titulo,
  subtitulo,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  subtitulo: string;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={30} color={colors.primarySoft} />
      </View>
      <Text style={styles.title}>{titulo}</Text>
      <Text style={styles.subtitle}>{subtitulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 32,
    fontSize: 30,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primarySoftBg,
    textAlign: 'center',
    lineHeight: 24,
  },
});

