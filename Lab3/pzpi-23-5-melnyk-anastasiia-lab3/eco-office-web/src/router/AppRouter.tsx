import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ProtectedRoute } from './ProtectedRoute';

// Макет
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// Сторінки
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import UserDashboard from '../pages/user/Dashboard';
import PlantDetails from '../pages/user/PlantDetails'; 
import PlantSpecies from '../pages/user/PlantSpecies';
import UserTasks from '../pages/user/Tasks'; // <-- ІМПОРТ СТОРІНКИ ЗАВДАНЬ
import AdminDashboard from '../pages/admin/AdminDashboard';

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50">
    <h1 className="text-6xl font-extrabold text-slate-300 mb-4">403</h1>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Доступ обмежено</h2>
    <p className="text-slate-500 max-w-md mb-6">Ваша роль не має доступу до цієї панелі керування.</p>
    <a href="/" className="eco-btn-primary">Повернутись на головну</a>
  </div>
);

export default function AppRouter() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const hasToken = !!localStorage.getItem('eco_office_token');
  
  if (isLoading && hasToken && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-brand-600"></div>
        <p className="text-sm font-semibold text-slate-500">Синхронізація з сервером...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Доступ до робочого простору для всіх співробітників */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'OFFICE_MANAGER', 'FLORIST', 'CLEANER']} />}>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            {/* Окрема сторінка для завдань */}
            <Route path="/tasks" element={<UserTasks />} />
            <Route path="/plants/:id" element={<PlantDetails />} />
            <Route path="/species" element={<PlantSpecies />} />
          </Route>
        </Route>

        {/* Доступ ТІЛЬКИ для ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}