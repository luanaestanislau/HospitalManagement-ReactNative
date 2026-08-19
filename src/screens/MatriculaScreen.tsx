import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../App';
import { AuthHeader } from '../components/AuthHeader';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Matricula'>;

export function MatriculaScreen({ navigation }: Props) {
  const { user, confirmRegistration, authenticated } = useApp();

  useEffect(() => {
    if (!authenticated) {
      navigation.replace('Login');
    }
  }, [authenticated, navigation]);

  const confirm = async () => {
    const ok = await confirmRegistration();
    if (ok) navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    else Alert.alert('Erro', 'Não foi possível confirmar a matrícula.');
  };

  return (
    <LoadingOverlay loading={false}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <AuthHeader icon="id-card-outline" titulo="Matrícula" subtitulo="Confirme seus dados funcionais" />

        {[
          ['Matrícula funcional', user?.matricula ?? 'Gerando...'],
          ['E-mail', user?.email ?? ''],
          ['Departamento', user?.departamento ?? ''],
          ['Cargo / Função', user?.cargo ?? ''],
          ['Registro profissional', user?.registroProfissional ?? ''],
        ].map(([label, value]) => (
          <View key={label} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.fieldText}>{value}</Text>
            </View>
          </View>
        ))}

        <Pressable onPress={confirm} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Confirmar e avançar</Text>
        </Pressable>
      </ScrollView>
    </LoadingOverlay>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 28,
  },
  back: {
    color: colors.text,
    fontSize: 28,
  },
  field: {
    marginTop: 10,
  },
  fieldLabel: {
    color: colors.primarySoftBg,
    fontSize: 15,
  },
  fieldValue: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldText: {
    color: colors.text,
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 48,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
