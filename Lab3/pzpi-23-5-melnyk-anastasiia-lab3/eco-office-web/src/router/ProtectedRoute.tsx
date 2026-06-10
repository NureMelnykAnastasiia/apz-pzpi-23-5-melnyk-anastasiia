import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type {UserRole } from '../store/authStore';
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Запобігає редіректу під час отримання профілю користувача
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-brand-600"></div>
        <p className="text-sm font-semibold text-slate-500">Авторизація...</p>
      </div>
    );
  }

  // Якщо користувач не увійшов в систему
  if (!isAuthenticated || !user) {
    // Передаємо поточний шлях у state, щоб повернути сюди користувача після входу
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Якщо роль користувача не відповідає дозволеній для цього маршруту
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Якщо все успішно — рендеримо дочірні роути
  return <Outlet />;
};