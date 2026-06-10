
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Title, Menu } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterDto } from '../../schemas/auth.schema';
import { authService } from '../../api/services/authService';
import { useAuthStore, Role } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';



export const RegisterScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigation = useNavigation<any>();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', fullName: '', role: 'CLEANER' },
  });

  const selectedRole = watch('role') as Role;

  const onSubmit = async (data: RegisterDto) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      login(res.token, res.user);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Помилка реєстрації', error.response?.data?.message || 'Не вдалося створити акаунт. Можливо, email вже зайнятий.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Title style={styles.title}>Новий акаунт</Title>
        <Text style={styles.subtitle}>Приєднуйтесь до команди Eco Office</Text>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="ПІБ" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.fullName} style={styles.input} activeOutlineColor="#4CAF50" />
          )}
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}

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
          Зареєструватися
        </Button>

        <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} textColor="#2E7D32">
          Вже маєте акаунт? Увійти
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#2E7D32', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 32 },
  input: { marginBottom: 8, backgroundColor: '#fff' },
  errorText: { color: '#B00020', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  button: { marginTop: 16, paddingVertical: 6 },
});