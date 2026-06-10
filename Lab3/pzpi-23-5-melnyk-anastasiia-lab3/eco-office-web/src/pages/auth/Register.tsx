import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, User as UserIcon } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, error, isLoading, clearError, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Якщо реєстрація (і подальший логін) успішні
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Валідація
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setLocalError('Будь ласка, заповніть усі поля');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Паролі не збігаються');
      return;
    }

    if (password.length < 6) {
      setLocalError('Пароль має містити щонайменше 6 символів');
      return;
    }

    const success = await register(fullName, email, password);
    if (!success && !error) {
      // Якщо помилка не записалась у store
      setLocalError("Сталася помилка при з'єднанні з сервером");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-emerald-950 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-2 relative z-10">
          <Leaf className="h-8 w-8 text-emerald-500" />
          <span className="font-bold text-2xl tracking-wide">Еко Офіс</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg">
          <h2 className="text-4xl font-black leading-tight text-white">
            Приєднуйтесь до команди <br/><span className="text-emerald-400">еко-свідомих</span>
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg">
            Створіть свій обліковий запис, щоб керувати рослинами, виконувати завдання та слідкувати за кліматом в нашому офісі.
          </p>
        </div>

        <div className="text-sm text-slate-500 relative z-10 font-medium">
          © {new Date().getFullYear()} Eco Office Management
        </div>
      </div>

      {/* Права частина: Форма реєстрації */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center gap-2 text-emerald-600 font-bold text-2xl mb-4">
              <Leaf className="h-7 w-7" />
              <span>Еко Офіс</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Реєстрація</h1>
            <p className="text-slate-500 mt-2 text-sm">Створіть новий корпоративний акаунт</p>
          </div>

          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 font-medium">
                {localError || error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ПІБ */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Прізвище та Ім'я</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  placeholder="Іван Іванов"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Електронна пошта</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  placeholder="worker@eco.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Пароль */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Пароль</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Підтвердження пароля */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Повторіть пароль</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  <span>Створення акаунту...</span>
                </>
              ) : (
                <span>Зареєструватися</span>
              )}
            </button>

            {/* Лінк на сторінку входу */}
            <div className="text-center pt-6 border-t border-slate-100 mt-6">
              <p className="text-sm text-slate-500 font-medium">
                Вже маєте обліковий запис?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Увійти
                </button>
              </p>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}