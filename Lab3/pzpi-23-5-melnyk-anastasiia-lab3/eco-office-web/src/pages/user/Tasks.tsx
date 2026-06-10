import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { taskService, logService } from '../../api/services';
import { ClipboardList, CheckCircle2, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import type { Task } from '../../types';

export default function UserTasks() {
  const { user } = useAuthStore();
  const currentRole = user?.role || 'CLEANER';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await taskService.getAll();
      
      if (res.data) {
        const roleTasks = res.data.filter((t: Task) => t.requiredRole === currentRole || currentRole === 'ADMIN');
        setTasks(roleTasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Помилка завантаження завдань:", err);
      setError("Не вдалося синхронізувати список завдань з сервером.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentRole]);

  const handleCompleteTask = async (task: Task) => {
    try {
      setActionLoading(task.id);
      
      // 1. Оновлюємо статус таски на бекенді
      await taskService.updateStatus(task.id, 'COMPLETED').catch(() => {});

      // 2. Створюємо лог
      await logService.create({
        plantId: task.plantId,
        taskId: task.id,
        type: task.type,
        notes: `Завдання виконано: ${user?.fullName} `,
        verifiedByScan: false
      }).catch(() => {});

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'COMPLETED' } : t));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand-600"></div>
        <p className="text-xs text-slate-400 font-bold">Оновлення списку завдань...</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Завдання на зміну</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Виконуйте призначені завдання для підтримки екосистеми офісу</p>
          </div>
        </div>
        <button 
          onClick={fetchTasks}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Оновити</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 px-1">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          Активні завдання ({pendingTasks.length})
        </h3>
        
        {pendingTasks.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl border-dashed">
            <CheckCircle2 className="h-12 w-12 text-emerald-200 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-600">Всі завдання виконано!</h3>
            <p className="text-sm text-slate-400 mt-1">Ви чудово попрацювали, наразі активних завдань немає.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingTasks.map(task => (
              <div key={task.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-brand-200 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.priority === 3 ? 'bg-red-100 text-red-700' : 
                      task.priority === 2 ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {task.priority === 3 ? 'Терміново' : task.priority === 2 ? 'Середній' : 'Звичайний'} • {task.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">ID Рослини: {task.plantId.substring(0, 5)}...</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{task.description || 'Опис завдання відсутній'}</p>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Дедлайн: {new Date(task.dueDate).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleCompleteTask(task)}
                  disabled={actionLoading === task.id}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {actionLoading === task.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Виконати</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
            <CheckCircle2 className="h-4 w-4" />
            Виконано сьогодні ({completedTasks.length})
          </h3>
          <div className="grid gap-3 opacity-60">
            {completedTasks.map(task => (
              <div key={task.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-600 line-through">{task.description || task.type}</p>
                  <span className="text-[10px] font-bold uppercase text-slate-400 mt-1 block">ID: {task.plantId.substring(0, 8)}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">Виконано</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}