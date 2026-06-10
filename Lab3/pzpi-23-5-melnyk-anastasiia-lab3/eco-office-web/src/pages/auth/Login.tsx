import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    login,
    error,
    isLoading,
    clearError,
    isAuthenticated,
    user,
  } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated && user) {
      if (from && from !== '/login' && from !== '/') {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', {
          replace: true,
        });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Будь ласка, заповніть усі поля');
      return;
    }

    await login(email, password);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 to-emerald-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-emerald-500" />
          <span className="font-bold text-2xl">Еко Офіс</span>
        </div>

        <div className="space-y-6 max-w-lg">
          <h2 className="text-4xl font-black">
            Робоча консоль <br />
            <span className="text-emerald-400">екологічного контролю</span>
          </h2>
          <p className="text-slate-300 text-lg">
            Авторизуйтесь для доступу до системи моніторингу.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} Eco Office
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-black">Вхід</h1>
            <p className="text-slate-500">Увійдіть у систему</p>
          </div>

          {/* ERRORS */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="text-sm text-red-700">
                {localError || error}
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-xs font-bold text-slate-500">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl"
                  placeholder="admin@eco.com"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs font-bold text-slate-500">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3.5 text-slate-400 h-5 w-5" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border rounded-xl"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? 'Вхід...' : 'Увійти в кабінет'}
            </button>
          </form>

          {/* REGISTER */}
          <p className="text-center text-sm text-slate-500">
            Немає акаунту?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-emerald-600 font-bold"
            >
              Зареєструватися
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}