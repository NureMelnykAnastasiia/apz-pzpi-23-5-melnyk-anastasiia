import { create } from 'zustand';
import { apiClient } from '../api/client';

export type UserRole = 'ADMIN' | 'OFFICE_MANAGER' | 'FLORIST' | 'CLEANER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Допоміжна функція для безпечного декодування JWT токена на клієнті
const decodeJwt = (token: string): { id: string; role: UserRole; exp?: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Помилка декодування JWT токена:", error);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('eco_office_token'),
  isAuthenticated: false,
  isLoading: true, // Починаємо в стані завантаження для перевірки сесії
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Запит до вашого Express-бекенду на /api/auth/login
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Зберігаємо сесію локально
      localStorage.setItem('eco_office_token', token);
      localStorage.setItem('eco_office_user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    } catch (err: any) {
      console.error("Помилка авторизації:", err);
      
      const serverResponse = err.response?.data;
      let errorMessage = 'Неправильний email або пароль';

      if (serverResponse) {
        if (Array.isArray(serverResponse.errors)) {
          errorMessage = serverResponse.errors.map((e: any) => e.message || e.msg).join(', ');
        } else if (typeof serverResponse.message === 'string') {
          errorMessage = serverResponse.message;
        } else if (serverResponse.error) {
          errorMessage = serverResponse.error;
        }
      }

      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Надсилаємо запит на реєстрацію. За замовчуванням даємо роль CLEANER
      await apiClient.post('/auth/register', { 
        fullName, 
        email, 
        password, 
        role: 'CLEANER' 
      });

      // 2. Якщо бекенд після реєстрації вимагає логін - робимо його автоматично
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('eco_office_token', token);
      localStorage.setItem('eco_office_user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      console.error("Помилка реєстрації:", err);
      
      const serverResponse = err.response?.data;
      let errorMessage = 'Помилка при створенні акаунту';

      if (serverResponse) {
        if (Array.isArray(serverResponse.errors)) {
          errorMessage = serverResponse.errors.map((e: any) => e.message || e.msg).join(', ');
        } else if (typeof serverResponse.message === 'string') {
          errorMessage = serverResponse.message;
        } else if (serverResponse.error) {
          errorMessage = serverResponse.error;
        }
      }

      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('eco_office_token');
    localStorage.removeItem('eco_office_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isLoading: false
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('eco_office_token');
    const savedUser = localStorage.getItem('eco_office_user');
    
    if (!token) {
      localStorage.removeItem('eco_office_token');
      localStorage.removeItem('eco_office_user');
      set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      return;
    }

    // Декодуємо токен та перевіряємо його на валідність та термін дії
    const decoded = decodeJwt(token);
    const now = Date.now() / 1000;

    if (!decoded || (decoded.exp && decoded.exp < now)) {
      console.warn("Токен невалідний або його термін дії закінчився.");
      localStorage.removeItem('eco_office_token');
      localStorage.removeItem('eco_office_user');
      set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      // Якщо є збережені дані користувача, використовуємо їх
      let currentUser: User;
      
      if (savedUser) {
        currentUser = JSON.parse(savedUser) as User;
      } else {
        // Якщо дані користувача видалилися, але токен валідний,
        // відновлюємо базовий профіль безпосередньо з JWT-токену
        currentUser = {
          id: decoded.id,
          email: '', // Емейл відновити з токену не можемо, якщо його там немає
          fullName: 'Співробітник',
          role: decoded.role
        };
      }
      
      set({
        user: currentUser,
        token: token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (err) {
      console.error("Помилка відновлення сесії:", err);
      localStorage.removeItem('eco_office_token');
      localStorage.removeItem('eco_office_user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null })
}));