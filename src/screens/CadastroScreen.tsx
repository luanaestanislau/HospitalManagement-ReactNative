import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthHeader } from '../components/AuthHeader';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export function CadastroScreen({ navigation }: Props) {
  const { register, error, loading } = useApp();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const onRegister = async () => {
    if (!nome || !email || senha.length < 8) return;
    const ok = await register(nome.trim(), email.trim(), senha);
    if (ok) navigation.replace('Login');
  };

  return (
    <LoadingOverlay loading={loading}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <AuthHeader icon="person-add-outline" titulo="Cadastro" subtitulo="Registre seus dados institucionais" />

        <Text style={styles.label}>Nome completo</Text>
        <TextInput value={nome} onChangeText={setNome} placeholder="Digite seu nome" style={styles.input} />

        <Text style={styles.label}>E-mail institucional</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="nome@hospital.com" autoCapitalize="none" style={styles.input} />

        <Text style={styles.label}>Senha</Text>
        <TextInput value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry style={styles.input} />

        <Pressable onPress={onRegister} disabled={loading} style={[styles.primaryButton, loading && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>Cadastrar</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
    gap: 0,
  },
  back: {
    color: colors.text,
    fontSize: 28,
  },
  label: {
    marginTop: 20,
    marginBottom: 8,
    color: colors.primarySoftBg,
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButton: {
    marginTop: 30,
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
  disabledButton: {
    opacity: 0.6,
  },
  error: {
    marginTop: 8,
    color: colors.danger,
  },
});
