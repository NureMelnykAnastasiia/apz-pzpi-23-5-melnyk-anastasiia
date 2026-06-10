import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  plantService, sensorService, readingService, logService, taskService 
} from '../../api/services';
import { 
  ArrowLeft, Leaf, Activity, History, ClipboardCheck, 
  Droplet, Thermometer, Wind, Sun, Battery, AlertCircle, CheckCircle2,
  RefreshCw, Edit2, Save, X
} from 'lucide-react';
import type { Plant, Sensor, SensorReading, CareLog, Task } from '../../types';

export default function PlantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); 
  const [error, setError] = useState<string | null>(null);

  // Стан для інлайн-редагування
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Plant>>({});

  const canEditPlant = ['ADMIN', 'FLORIST', 'OFFICE_MANAGER'].includes(user?.role || '');

  const fetchDetailedData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      
      const plantRes = await plantService.getById(id);
      if (!plantRes.data) {
        setError("Рослину не знайдено на сервері.");
        setLoading(false);
        return;
      }
      setPlant(plantRes.data);

      const [sensorsRes, readingsRes, logsRes, tasksRes] = await Promise.all([
        sensorService.getAll().catch(() => ({ data: [] })),
        readingService.getAll().catch(() => ({ data: [] })),
        logService.getAll().catch(() => ({ data: [] })),
        taskService.getAll().catch(() => ({ data: [] }))
      ]);

      const foundSensor = (sensorsRes.data || []).find((s) => s.plantId === id);
      
      if (foundSensor) {
        setSensor(foundSensor);
        const filteredReadings = (readingsRes.data || []).filter((r) => r.sensorId === foundSensor.id);
        setReadings(filteredReadings);
      } else {
        setSensor(null);
        setReadings([]);
      }

      const filteredLogs = (logsRes.data || []).filter((l) => l.plantId === id);
      const filteredTasks = (tasksRes.data || []).filter((t) => t.plantId === id);
      
      const sortedLogs = filteredLogs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setCareLogs(sortedLogs);
      setTasks(filteredTasks);

    } catch (err) {
      console.error("Критична помилка деталізації:", err);
      setError("Не вдалося завантажити деталі рослини. Перевірте з'єднання з сервером.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailedData();
  }, [id]);

  const handleEditClick = () => {
    if (!plant) return;
    setEditForm({
      name: plant.name,
      qrCodeId: plant.qrCodeId,
      healthStatus: plant.healthStatus
    });
    setIsEditing(true);
  };

  const handleSavePlant = async () => {
    if (!id) return;
    try {
      await plantService.update(id, editForm);
      setPlant(prev => prev ? { ...prev, ...editForm as Plant } : null);
      setIsEditing(false);
    } catch (err) {
      console.error("Помилка збереження рослини:", err);
      alert("Помилка збереження змін. Перевірте підключення до сервера.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleCompleteTask = async (taskId: string, type: string) => {
    if (!id) return;
    setActionLoading(taskId);
    try {
      await taskService.updateStatus(taskId, 'COMPLETED').catch(() => {});
      await logService.create({
        plantId: id,
        taskId: taskId,
        type: type,
        notes: `Завдання виконано співробітником: ${user?.fullName || 'Невідомий'}`,
        verifiedByScan: false
      }).catch(() => {});

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t));
      
      const newLog: CareLog = {
        id: `temp-${Date.now()}`,
        plantId: id,
        taskId: taskId,
        type: type,
        notes: `Завдання виконано співронням: ${user?.fullName}`,
        verifiedByScan: false,
        createdAt: new Date().toISOString()
      };
      setCareLogs(prev => [newLog, ...prev]);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand-600"></div>
        <p className="text-xs text-slate-400 font-bold">Отримання паспорта рослини з БД...</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100 max-w-2xl mx-auto shadow-sm">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-700">{error || 'Рослину не знайдено'}</h2>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="mt-4 px-6 py-2 bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors rounded-xl"
        >
          Повернутися на дашборд
        </button>
      </div>
    );
  }

  const getLatest = (type: SensorReading['type']) => {
    const filtered = readings.filter(r => r.type === type);
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => {
      const dateA = a.recordedAt ? new Date(a.recordedAt).getTime() : 0;
      const dateB = b.recordedAt ? new Date(b.recordedAt).getTime() : 0;
      return dateA - dateB;
    })[filtered.length - 1];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Повернутися до карти офісу</span>
      </button>

      {/* Паспорт рослини */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -z-10"></div>
        
        <div className="h-32 w-32 bg-brand-100 rounded-2xl flex items-center justify-center border border-brand-200 shrink-0 shadow-inner z-10">
          <Leaf className="h-12 w-12 text-brand-600" />
        </div>
        
        <div className="space-y-4 z-10 w-full">
          {isEditing ? (
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-3 w-full max-w-sm">
                <input 
                  type="text" 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-white border border-brand-300 rounded-xl px-3 py-2 text-xl font-black text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Назва рослини"
                />
                <input 
                  type="text" 
                  value={editForm.qrCodeId || ''} 
                  onChange={e => setEditForm({...editForm, qrCodeId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Унікальний QR-код ID"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={editForm.healthStatus}
                  onChange={e => setEditForm({...editForm, healthStatus: e.target.value as any})}
                  className="bg-white border border-brand-300 text-xs font-bold text-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                >
                  <option value="HEALTHY">HEALTHY (Норма)</option>
                  <option value="NEEDS_ATTENTION">NEEDS_ATTENTION (Увага)</option>
                  <option value="CRITICAL">CRITICAL (Критично)</option>
                </select>
                <button onClick={handleSavePlant} className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors">
                  <Save className="h-4 w-4" /> Зберегти
                </button>
                <button onClick={handleCancelEdit} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">{plant.name || 'Офісна рослина'}</h1>
                  {canEditPlant && (
                    <button onClick={handleEditClick} className="p-1.5 text-slate-400 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 rounded-lg transition-colors border border-slate-100" title="Редагувати параметри рослини">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm font-mono text-slate-500 font-semibold mt-1 flex items-center gap-2">
                  <span>QR: {plant.qrCodeId}</span>
                  {sensor ? (
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] uppercase border border-slate-200">
                      Сенсор: {sensor.macAddress}
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] uppercase border border-amber-100">
                      Без сенсора
                    </span>
                  )}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                plant.healthStatus === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                plant.healthStatus === 'NEEDS_ATTENTION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {plant.healthStatus === 'HEALTHY' && 'Норма'}
                {plant.healthStatus === 'NEEDS_ATTENTION' && 'Увага'}
                {plant.healthStatus === 'CRITICAL' && 'Критично'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Droplet className="h-3 w-3 text-blue-500"/> Ґрунт</span>
              <p className="text-xl font-black text-slate-800">{getLatest('SOIL_MOISTURE')?.value ?? '--'}%</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Thermometer className="h-3 w-3 text-orange-500"/> Темп.</span>
              <p className="text-xl font-black text-slate-800">{getLatest('AIR_TEMPERATURE')?.value ?? '--'}°C</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Wind className="h-3 w-3 text-teal-500"/> Повітря</span>
              <p className="text-xl font-black text-slate-800">{getLatest('AIR_HUMIDITY')?.value ?? '--'}%</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Sun className="h-3 w-3 text-amber-500"/> Світло</span>
              <p className="text-xl font-black text-slate-800">{getLatest('LIGHT_INTENSITY')?.value ?? '--'}Lx</p>
            </div>
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Battery className="h-3 w-3 text-slate-500"/> Заряд</span>
              <p className="text-xl font-black text-slate-800">{getLatest('BATTERY_LEVEL')?.value ?? '--'}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-6">
            <Activity className="h-4 w-4 text-brand-600" />
            <span>Необхідний догляд (Завдання)</span>
          </h3>
          
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Наразі для цієї рослини немає активних завдань.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      task.priority === 3 ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {task.type}
                    </span>
                    <p className="text-sm font-bold text-slate-800 mt-1.5">{task.description || 'Без опису'}</p>
                  </div>

                  {task.status !== 'COMPLETED' ? (
                    <button 
                      onClick={() => handleCompleteTask(task.id, task.type)}
                      disabled={actionLoading === task.id}
                      className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 flex items-center gap-2"
                    >
                      {actionLoading === task.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Виконати"}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Виконано
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-6">
            <History className="h-4 w-4 text-brand-600" />
            <span>Журнал операцій (Історія догляду)</span>
          </h3>
          
          <div className="relative border-l-2 border-slate-100 pl-4 space-y-6 ml-2">
            {careLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic -ml-4">Записів про догляд ще немає.</p>
            ) : (
              careLogs.map((log) => (
                <div key={log.id} className="relative">
                  <div className={`absolute -left-5.25 top-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    log.verifiedByScan ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}></div>
                  <div className="space-y-1 -mt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700">{log.type}</span>
                      {log.verifiedByScan && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <ClipboardCheck className="h-3 w-3" /> QR-скан
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{log.notes || 'Без приміток'}</p>
                    {log.createdAt && (
                      <p className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleString('uk-UA')}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}