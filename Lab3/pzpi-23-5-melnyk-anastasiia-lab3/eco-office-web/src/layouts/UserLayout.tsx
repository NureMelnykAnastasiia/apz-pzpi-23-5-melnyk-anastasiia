import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Leaf, LogOut, LayoutDashboard, BookOpen, ClipboardList, Shield } from 'lucide-react';

export default function UserLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const hasPlantAccess = ['ADMIN', 'FLORIST', 'OFFICE_MANAGER'].includes(user?.role || '');
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      
      {/* Бокове меню (Sidebar) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-10 shadow-sm">
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl mb-8 pl-2">
            <Leaf className="h-6 w-6" />
            <span>Еко Офіс</span>
          </div>
          
          <nav className="space-y-1.5">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Робочий стіл</span>
            </Link>

            <Link 
              to="/tasks" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive('/tasks') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              <span>Завдання</span>
            </Link>

            {hasPlantAccess && (
              <Link 
                to="/species" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/species') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>Довідник видів</span>
              </Link>
            )}

            <div className="my-4 border-t border-slate-100"></div>

           

            {isAdmin && (
              <>
                <div className="my-4 border-t border-slate-100"></div>
                <Link 
                  to="/admin" 
                  className="flex items-center gap-3 px-4 py-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors font-bold text-sm"
                >
                  <Shield className="h-5 w-5" />
                  <span>Адмін Панель</span>
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {/* Кнопка виходу та профіль */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 bg-emerald-100 text-emerald-700 rounded-xl font-black text-sm flex items-center justify-center shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-[9px] text-slate-500 font-bold tracking-wider truncate uppercase">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Вийти</span>
          </button>
        </div>
      </aside>

      {/* Основний контент сторінки */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h1 className="text-sm font-bold text-slate-600 hidden sm:block">Робочий простір</h1>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 ml-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">Online</span>
          </div>
        </header>
        <main className="p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}