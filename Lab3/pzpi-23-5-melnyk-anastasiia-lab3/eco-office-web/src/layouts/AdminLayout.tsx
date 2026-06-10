import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Leaf, LogOut, LayoutDashboard, Shield } from 'lucide-react';

export default function UserLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50">
    
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div className="p-6">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl mb-8">
            <Leaf className="h-6 w-6" />
            <span>Еко Офіс</span>
          </div>
          <nav className="space-y-1">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Робочий стіл</span>
            </Link>
           

           
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 transition-colors mt-4 border border-emerald-100"
              >
                <Shield className="h-5 w-5" />
                <span>Глобальний Адмін</span>
              </Link>
            )}
          </nav>
        </div>
        
        {/* Кнопка виходу та інформація користувача внизу */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 bg-brand-600 text-white rounded-xl font-bold text-sm flex items-center justify-center">
              {user?.fullName?.charAt(0) || 'E'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Вийти з системи</span>
          </button>
        </div>
      </aside>

      {/* Основний контент сторінки */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {isActive('/dashboard') && 'Особистий кабінет робітника'}
            {isActive('/report') && 'Подача звіту'}
            {isActive('/booking') && 'Бронювання еко-локацій'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-500 font-semibold">Сервер онлайн</span>
          </div>
        </header>
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}