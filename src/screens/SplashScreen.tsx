import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthHeader } from '../components/AuthHeader';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { bootstrapped, authenticated } = useApp();

  useEffect(() => {
    if (bootstrapped && authenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  }, [authenticated, bootstrapped, navigation]);

  return (
   <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <ScrollView contentContainerStyle={styles.content}>
        <AuthHeader
          icon="medical-outline"
          titulo="MediStock"
          subtitulo="Gestão interna de insumos hospitalares com IA"
        />
        <View style={styles.list}>
          {[
            'Alertas e avisos em tempo real',
            'Estoque crítico com cálculo básico',
            'Distribuição entre hospitais',
            'Redistribuição entre hospitais',
            'Otimização interna de armazenagem',
          ].map((item) => (
            <View key={item} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark" size={16} color={colors.primarySoft} />
              </View>
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </Pressable>
          <View style={styles.secondaryButton}>
            <Button title="Saiba mais" color={colors.primarySoftBg} onPress={() => {}} />
          </View>
          <Text style={styles.version}>v1.0.0 · Seguro e conforme com a LGPD</Text>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  list: {
    marginTop: 48,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    color: colors.primarySoftBg,
    fontSize: 15,
  },
  footer: {
    marginTop: 'auto',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primarySoftBg,
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    color: colors.primarySoft,
    fontSize: 11,
  },
});
