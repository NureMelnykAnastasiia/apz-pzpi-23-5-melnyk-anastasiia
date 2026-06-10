import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginDto } from '../../schemas/auth.schema';
import { authService } from '../../api/services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigation = useNavigation<any>();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      login(res.token, res.user);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Помилка входу', error.response?.data?.message || 'Невірний email або пароль. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.formContainer}>
        <Title style={styles.title}>Eco Office</Title>
        <Text style={styles.subtitle}>Увійдіть у свій обліковий запис</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Email" mode="outlined" autoCapitalize="none" keyboardType="email-address" onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.email} style={styles.input} activeOutlineColor="#4CAF50" />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Пароль" mode="outlined" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.password} style={styles.input} activeOutlineColor="#4CAF50" />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isLoading} disabled={isLoading} style={styles.button} buttonColor="#4CAF50">
          Увійти
        </Button>

        <Button mode="text" onPress={() => navigation.navigate('Register')} style={styles.registerBtn} textColor="#2E7D32">
          Немає акаунту? Зареєструватися
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  formContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#2E7D32', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 32 },
  input: { marginBottom: 8, backgroundColor: '#fff' },
  errorText: { color: '#B00020', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  button: { marginTop: 16, paddingVertical: 6 },
  registerBtn: { marginTop: 12 },
});