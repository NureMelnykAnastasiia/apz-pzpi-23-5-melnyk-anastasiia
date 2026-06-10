import axios from 'axios';

// Налаштування базової URL вашого бекенду
// Якщо використовуєте .env, Vite автоматично підтягне VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехоплювач запитів для автоматичного підкріплення JWT-токена
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eco_office_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехоплювач відповідей для логування або автоматичного виходу у разі закінчення сесії (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Автоматичний логаут у разі протермінованого токена
      localStorage.removeItem('eco_office_token');
      // Можна викликати метод логауту з authStore, якщо він імпортований динамічно,
      // або просто перенаправити користувача на сторінку входу
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);