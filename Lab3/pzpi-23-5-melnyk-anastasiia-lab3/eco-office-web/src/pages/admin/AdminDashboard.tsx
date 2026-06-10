import React, { useEffect, useState } from 'react';
import { 
  userService, plantService, locationService, sensorService, 
  logService, speciesService, readingService, adminService, taskService
} from '../../api/services';
import { 
  ShieldCheck, Users, ClipboardList, PlusCircle, 
  CheckCircle2, RefreshCw, Trash2, XCircle,
  MapPin, Cpu, History, Save, X, Edit2, Leaf, Download,
  LineChart, Thermometer, Droplet, Sun, Battery, Wind, Activity
} from 'lucide-react';
import type { WorkerUser, Plant, Location, Sensor, CareLog, PlantSpecies, SensorReading } from '../../types';

type TabType = 'MAIN' | 'LOCATIONS' | 'PLANTS' | 'SENSORS' | 'READINGS' | 'LOGS';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('MAIN');
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Стан для списків даних
  const [workers, setWorkers] = useState<WorkerUser[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [species, setSpecies] = useState<PlantSpecies[]>([]); 
  const [readings, setReadings] = useState<SensorReading[]>([]);

  // Стан для форми нових завдань
  const [newTask, setNewTask] = useState({ plantId: '', requiredRole: 'FLORIST' as WorkerUser['role'], type: 'WATERING', priority: 1, description: '' });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState(false);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  // Форма локацій
  const [locForm, setLocForm] = useState<Partial<Location>>({});
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [showLocForm, setShowLocForm] = useState(false);

  // Форма рослин
  const [plantForm, setPlantForm] = useState<Partial<Plant>>({ healthStatus: 'HEALTHY' });
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [showPlantForm, setShowPlantForm] = useState(false);

  // Форма сенсорів
  const [sensorForm, setSensorForm] = useState<Partial<Sensor>>({ isActive: true });
  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [showSensorForm, setShowSensorForm] = useState(false);

  const [selectedReadingType, setSelectedReadingType] = useState<string>('ALL');

  // Резервне копіювання
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersRes, plantsRes, locsRes, sensorsRes, logsRes, speciesRes, readingsRes] = await Promise.all([
        userService.getAll().catch(() => ({ data: [] })),
        plantService.getAll().catch(() => ({ data: [] })),
        locationService.getAll().catch(() => ({ data: [] })),
        sensorService.getAll().catch(() => ({ data: [] })),
        logService.getAll().catch(() => ({ data: [] })),
        speciesService.getAll().catch(() => ({ data: [] })),
        readingService.getAll().catch(() => ({ data: [] }))
      ]);

      setWorkers(usersRes.data || []);
      setPlants(plantsRes.data || []);
      setLocations(locsRes.data || []);
      setSensors(sensorsRes.data || []);
      setSpecies(speciesRes.data || []);
      
      const fetchedReadings = readingsRes.data || [];
      setReadings(fetchedReadings.sort((a, b) => new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime()));

      const fetchedLogs = logsRes.data || [];
      setLogs(fetchedLogs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));

    } catch (err) {
      console.error("Помилка завантаження даних адмінки:", err);
      setError("Не вдалося завантажити дані системи.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const triggerError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  const handleBackupDatabase = async () => {
    try {
      setBackupLoading(true);
      setBackupSuccess(false);
      
      const response = await adminService.getBackup();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eco_office_backup_${new Date().toISOString().split('T')[0]}.sql`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 4000);
    } catch (err) {
      console.warn("Локальний бекап у JSON за відсутності серверного ендпоінту...");
      const dbDump = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        tables: { users: workers, plants, locations, sensors, logs, species, readings }
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dbDump, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `eco_office_db_dump_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 4000);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleChangeRole = async (workerId: string, newRole: WorkerUser['role']) => {
    const targetWorker = workers.find(w => w.id === workerId);
    if (!targetWorker) return;
    try {
      setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, role: newRole } : w));
      await userService.update(workerId, { email: targetWorker.email, fullName: targetWorker.fullName, role: newRole });
    } catch (err) {
      triggerError("Не вдалося оновити роль працівника.");
    }
  };

  const handleDeleteUser = async (workerId: string) => {
    try {
      await userService.delete(workerId);
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      setConfirmDeleteUserId(null);
    } catch (err) {
      triggerError("Не вдалося видалити користувача.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.plantId) { triggerError("Оберіть рослину"); return; }
    try {
      setIsCreatingTask(true);
      await taskService.create({ ...newTask, priority: Number(newTask.priority), description: newTask.description || undefined });
      setTaskSuccess(true);
      setNewTask({ ...newTask, description: '', priority: 1 });
      setTimeout(() => setTaskSuccess(false), 3000);
    } catch (err) {
      triggerError("Помилка створення завдання.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...locForm, floorNumber: locForm.floorNumber ? Number(locForm.floorNumber) : undefined };
      if (editingLocId) {
        const res = await locationService.update(editingLocId, payload);
        setLocations(prev => prev.map(l => l.id === editingLocId ? { ...l, ...(res.data || payload) } as Location : l));
      } else {
        const res = await locationService.create(payload);
        setLocations(prev => [...prev, res.data]);
      }
      setShowLocForm(false); setEditingLocId(null); setLocForm({});
    } catch (err: any) { 
      triggerError(err.response?.data?.message || "Помилка збереження локації"); 
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm("Видалити цю локацію?")) return;
    try {
      await locationService.delete(id);
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (err) { triggerError("Не вдалося видалити локацію"); }
  };

  const handleSavePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: plantForm.name || undefined,
        qrCodeId: plantForm.qrCodeId || '',
        locationId: plantForm.locationId === '' ? null : (plantForm.locationId || null),
        speciesId: plantForm.speciesId === '' ? null : (plantForm.speciesId || null),
        healthStatus: plantForm.healthStatus || 'HEALTHY'
      };

      if (editingPlantId) {
        const res = await plantService.update(editingPlantId, payload);
        setPlants(prev => prev.map(p => p.id === editingPlantId ? { ...p, ...(res.data || payload) } as Plant : p));
      } else {
        const res = await plantService.create(payload);
        setPlants(prev => [...prev, res.data]);
      }
      setShowPlantForm(false); setEditingPlantId(null); setPlantForm({ healthStatus: 'HEALTHY' });
    } catch (err: any) {
      triggerError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Помилка збереження рослини");
    }
  };

  const handleDeletePlant = async (id: string) => {
    if (!window.confirm("Видалити цю рослину з бази даних?")) return;
    try {
      await plantService.delete(id);
      setPlants(prev => prev.filter(p => p.id !== id));
    } catch (err) { triggerError("Не вдалося видалити рослину"); }
  };

  const handleSaveSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        macAddress: sensorForm.macAddress || '',
        plantId: sensorForm.plantId === '' ? null : (sensorForm.plantId || null),
        sensorModel: sensorForm.sensorModel || undefined,
        firmwareVersion: sensorForm.firmwareVersion || undefined,
        isActive: sensorForm.isActive ?? true 
      };

      if (editingSensorId) {
        const res = await sensorService.update(editingSensorId, payload);
        setSensors(prev => prev.map(s => s.id === editingSensorId ? { ...s, ...(res.data || payload) } as Sensor : s));
      } else {
        const res = await sensorService.create(payload);
        setSensors(prev => [...prev, res.data]);
      }
      setShowSensorForm(false); setEditingSensorId(null); setSensorForm({ isActive: true });
    } catch (err: any) { 
      triggerError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Помилка збереження сенсора"); 
    }
  };

  const handleDeleteSensor = async (id: string) => {
    if (!window.confirm("Видалити цей сенсор?")) return;
    try {
      await sensorService.delete(id);
      setSensors(prev => prev.filter(s => s.id !== id));
    } catch (err) { triggerError("Не вдалося видалити сенсор"); }
  };

  const filteredReadings = selectedReadingType === 'ALL' 
    ? readings 
    : readings.filter(r => r.type === selectedReadingType);

  const getReadingIcon = (type: string) => {
    switch (type) {
      case 'SOIL_MOISTURE': return <Droplet className="h-4 w-4 text-blue-500" />;
      case 'AIR_TEMPERATURE': return <Thermometer className="h-4 w-4 text-orange-500" />;
      case 'AIR_HUMIDITY': return <Wind className="h-4 w-4 text-teal-500" />;
      case 'LIGHT_INTENSITY': return <Sun className="h-4 w-4 text-amber-500" />;
      case 'BATTERY_LEVEL': return <Battery className="h-4 w-4 text-slate-500" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getReadingLabel = (type: string) => {
    switch (type) {
      case 'SOIL_MOISTURE': return 'Вологість ґрунту';
      case 'AIR_TEMPERATURE': return 'Температура повітря';
      case 'AIR_HUMIDITY': return 'Вологість повітря';
      case 'LIGHT_INTENSITY': return 'Освітленість';
      case 'BATTERY_LEVEL': return 'Заряд батареї';
      default: return type;
    }
  };

  const getReadingUnit = (type: string) => {
    switch (type) {
      case 'SOIL_MOISTURE':
      case 'AIR_HUMIDITY':
      case 'BATTERY_LEVEL': return '%';
      case 'AIR_TEMPERATURE': return '°C';
      case 'LIGHT_INTENSITY': return ' Lx';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-700 border-t-brand-600"></div>
        <p className="text-xs text-slate-400 font-bold">Завантаження системних даних...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Шапка */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/10 mb-4">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              <span>Панель Управління</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Глобальний Адміністратор</h1>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Система диспетчеризації завдань, інфраструктури, керування пристроями та бекапу бд.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center relative z-10">
            <button 
              onClick={handleBackupDatabase}
              disabled={backupLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors text-xs font-bold rounded-xl text-white cursor-pointer"
            >
              {backupLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>Бекап БД</span>
            </button>

            <button onClick={fetchAdminData} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold rounded-xl border border-white/10 cursor-pointer">
              <RefreshCw className="h-4 w-4" /> Оновити дані
            </button>
          </div>
        </div>

        {backupSuccess && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-xl animate-fadeIn">
            Резервну копію успішно створено та завантажено на пристрій!
          </div>
        )}

        {/* НАВІГАЦІЯ */}
        <div className="relative z-10 mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveTab('MAIN')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'MAIN' ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            <Users className="h-4 w-4 inline-block mr-2 -mt-0.5" /> Персонал & Завдання
          </button>
          <button onClick={() => setActiveTab('LOCATIONS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'LOCATIONS' ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            <MapPin className="h-4 w-4 inline-block mr-2 -mt-0.5" /> Локації
          </button>
          <button onClick={() => setActiveTab('PLANTS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'PLANTS' ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            <Leaf className="h-4 w-4 inline-block mr-2 -mt-0.5" /> Рослини (Офіс)
          </button>
          <button onClick={() => setActiveTab('SENSORS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'SENSORS' ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            <Cpu className="h-4 w-4 inline-block mr-2 -mt-0.5" /> Сенсори (IoT)
          </button>
          <button onClick={() => setActiveTab('READINGS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'READINGS' ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            <LineChart className="h-4 w-4 inline-block mr-2 -mt-0.5" /> Показники сенсорів
          </button>
          <button onClick={() => setActiveTab('LOGS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'LOGS' ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            <History className="h-4 w-4 inline-block mr-2 -mt-0.5" /> Журнал подій (Logs)
          </button>
        </div>
      </div>

      {/* TAB: MAIN */}
      {activeTab === 'MAIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-600" /> Створення завдання
            </h3>
            <form onSubmit={handleCreateTask} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Рослина (Об'єкт) *</label>
                <select required value={newTask.plantId} onChange={(e) => setNewTask({...newTask, plantId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="" disabled>Оберіть рослину...</option>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.name || 'Рослина'} ({p.qrCodeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Тип робіт</label>
                  <select value={newTask.type} onChange={(e) => setNewTask({...newTask, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none">
                    <option value="WATERING">Полив</option><option value="FERTILIZING">Добрива</option><option value="LIGHT_ADJUSTMENT">Освітлення</option><option value="PEST_CONTROL">Лікування</option><option value="CLEANING">Клінінг</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Виконавець</label>
                  <select value={newTask.requiredRole} onChange={(e) => setNewTask({...newTask, requiredRole: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none">
                    <option value="FLORIST">Флорист</option><option value="CLEANER">Клінер</option><option value="OFFICE_MANAGER">Офіс-менеджер</option><option value="ADMIN">Адмін</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Пріоритет</label>
                <input type="range" min="1" max="3" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: Number(e.target.value)})} className="w-full accent-brand-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Опис</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none h-24" />
              </div>
              <button type="submit" disabled={isCreatingTask} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50">
                {isCreatingTask ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><PlusCircle className="h-5 w-5" /> Створити завдання</>}
              </button>
              {taskSuccess && <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2 justify-center"><CheckCircle2 className="h-4 w-4" /> Додано!</div>}
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" /> Персонал ({workers.length})
            </h3>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500">
                  <tr><th className="p-4">Співробітник</th><th className="p-4">Контакти</th><th className="p-4">Роль</th><th className="p-4 text-right">Управління</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{w.fullName}</td>
                      <td className="p-4 text-xs font-mono text-slate-500">{w.email}</td>
                      <td className="p-4"><span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2 py-1 rounded">{w.role}</span></td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <select value={w.role} onChange={(e) => handleChangeRole(w.id, e.target.value as any)} className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer">
                            <option value="ADMIN">ADMIN</option><option value="OFFICE_MANAGER">OFFICE_MANAGER</option><option value="FLORIST">FLORIST</option><option value="CLEANER">CLEANER</option>
                          </select>
                          {confirmDeleteUserId === w.id ? (
                            <div className="flex items-center gap-1"><button onClick={() => handleDeleteUser(w.id)} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded">Видалити</button><button onClick={() => setConfirmDeleteUserId(null)}><XCircle className="h-4 w-4 text-slate-400" /></button></div>
                          ) : (
                            <button onClick={() => setConfirmDeleteUserId(w.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LOCATIONS */}
      {activeTab === 'LOCATIONS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-600" /> Офісні локації
            </h3>
            <button onClick={() => { setLocForm({}); setEditingLocId(null); setShowLocForm(true); }} className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 flex items-center gap-2 cursor-pointer transition-colors">
              <PlusCircle className="h-4 w-4" /> Додати локацію
            </button>
          </div>

          {showLocForm && (
            <form onSubmit={handleSaveLocation} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
              <div className="w-full space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500">Назва *</label><input required type="text" value={locForm.name || ''} onChange={e=>setLocForm({...locForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div className="w-full space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500">Поверх</label><input type="number" value={locForm.floorNumber || ''} onChange={e=>setLocForm({...locForm, floorNumber: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div className="w-full space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500">Опис</label><input type="text" value={locForm.description || ''} onChange={e=>setLocForm({...locForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div className="flex gap-2 w-full md:w-auto shrink-0">
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold cursor-pointer transition-colors"><Save className="h-4 w-4" /></button>
                <button type="button" onClick={() => setShowLocForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold cursor-pointer transition-colors"><X className="h-4 w-4" /></button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500">
                <tr><th className="p-4 pl-6">Назва</th><th className="p-4">Поверх</th><th className="p-4">Опис</th><th className="p-4 text-right pr-6">Дії</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">Локацій не знайдено</td></tr> : null}
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 font-bold text-slate-800">{loc.name}</td>
                    <td className="p-4 font-mono text-xs">{loc.floorNumber ?? '-'}</td>
                    <td className="p-4 text-xs text-slate-500">{loc.description}</td>
                    <td className="p-4 text-right pr-6">
                      <button onClick={() => { setLocForm(loc); setEditingLocId(loc.id); setShowLocForm(true); }} className="p-1 text-slate-400 hover:text-brand-600 mr-2 cursor-pointer transition-colors"><Edit2 className="h-4 w-4 inline" /></button>
                      <button onClick={() => handleDeleteLocation(loc.id)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"><Trash2 className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PLANTS */}
      {activeTab === 'PLANTS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-brand-600" /> Рослини офісу
            </h3>
            <button onClick={() => { setPlantForm({ healthStatus: 'HEALTHY' }); setEditingPlantId(null); setShowPlantForm(true); }} className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 flex items-center gap-2 cursor-pointer transition-colors">
              <PlusCircle className="h-4 w-4" /> Додати рослину
            </button>
          </div>

          {showPlantForm && (
            <form onSubmit={handleSavePlant} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Назва рослини *</label>
                  <input required type="text" value={plantForm.name || ''} onChange={e=>setPlantForm({...plantForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="напр., Монстера" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">QR-код ID (наліпка) *</label>
                  <input required type="text" value={plantForm.qrCodeId || ''} onChange={e=>setPlantForm({...plantForm, qrCodeId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-brand-500" placeholder="QR-MN-01" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Вид рослини *</label>
                  <select required value={plantForm.speciesId || ''} onChange={e=>setPlantForm({...plantForm, speciesId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700">
                    <option value="" disabled>-- Оберіть вид --</option>
                    {species.map(s => <option key={s.id} value={s.id}>{s.commonName} ({s.scientificName})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Локація / Кімната</label>
                  <select value={plantForm.locationId || ''} onChange={e=>setPlantForm({...plantForm, locationId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">-- Без локації --</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Стан здоров'я</label>
                  <select value={plantForm.healthStatus || 'HEALTHY'} onChange={e=>setPlantForm({...plantForm, healthStatus: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="HEALTHY">HEALTHY (Норма)</option>
                    <option value="NEEDS_ATTENTION">NEEDS_ATTENTION (Увага)</option>
                    <option value="CRITICAL">CRITICAL (Критично)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setShowPlantForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-slate-200">Скасувати</button>
                <button type="submit" className="px-5 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-brand-700 flex items-center gap-1.5">
                  <Save className="h-4 w-4" /> Зберегти рослину
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500">
                <tr><th className="p-4 pl-6">Назва рослини</th><th className="p-4">Вид рослини</th><th className="p-4">QR ID</th><th className="p-4">Локація</th><th className="p-4">Здоров'я</th><th className="p-4 text-right pr-6">Дії</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plants.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">Рослини відсутні</td></tr> : null}
                {plants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 font-bold text-slate-850">{p.name || 'Офісна рослина'}</td>
                    <td className="p-4 text-xs font-bold text-brand-700">
                      {species.find(s => s.id === p.speciesId)?.commonName || <span className="text-slate-300 font-normal italic">Не визначено</span>}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500 font-semibold">{p.qrCodeId}</td>
                    <td className="p-4 text-xs text-slate-500 font-bold">{locations.find(l => l.id === p.locationId)?.name || 'Не вказано'}</td>
                    <td className="p-4 font-semibold text-slate-700">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.healthStatus === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' :
                        p.healthStatus === 'NEEDS_ATTENTION' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.healthStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button onClick={() => { setPlantForm(p); setEditingPlantId(p.id); setShowPlantForm(true); }} className="p-1 text-slate-400 hover:text-brand-600 mr-2 cursor-pointer transition-colors"><Edit2 className="h-4 w-4 inline" /></button>
                      <button onClick={() => handleDeletePlant(p.id)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"><Trash2 className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SENSORS */}
      {activeTab === 'SENSORS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-brand-600" /> Фізичні Сенсори
            </h3>
            <button onClick={() => { setSensorForm({ isActive: true }); setEditingSensorId(null); setShowSensorForm(true); }} className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 flex items-center gap-2 cursor-pointer transition-colors">
              <PlusCircle className="h-4 w-4" /> Додати сенсор
            </button>
          </div>

          {showSensorForm && (
            <form onSubmit={handleSaveSensor} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">MAC Адреса *</label>
                  <input required type="text" value={sensorForm.macAddress || ''} onChange={e=>setSensorForm({...sensorForm, macAddress: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-brand-500" placeholder="AA:BB:CC..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Прив'язка (Рослина)</label>
                  <select value={sensorForm.plantId || ''} onChange={e=>setSensorForm({...sensorForm, plantId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">-- Без прив'язки --</option>
                    {plants.map(p => <option key={p.id} value={p.id}>{p.name} ({p.qrCodeId})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Модель</label>
                  <input type="text" value={sensorForm.sensorModel || ''} onChange={e=>setSensorForm({...sensorForm, sensorModel: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="ESP32-S2" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Версія ПЗ</label>
                  <input type="text" value={sensorForm.firmwareVersion || ''} onChange={e=>setSensorForm({...sensorForm, firmwareVersion: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="1.0.0" />
                </div>
                
                <div className="flex items-center justify-between xl:justify-end gap-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={sensorForm.isActive} onChange={e=>setSensorForm({...sensorForm, isActive: e.target.checked})} className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer" />
                    Активний
                  </label>
                  <div className="flex gap-2 shrink-0">
                    <button type="submit" className="px-3 py-2 bg-brand-600 text-white rounded-lg cursor-pointer"><Save className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setShowSensorForm(false)} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500">
                <tr><th className="p-4 pl-6">MAC Адреса</th><th className="p-4">Рослина</th><th className="p-4">Модель</th><th className="p-4">Версія ПЗ</th><th className="p-4">Статус</th><th className="p-4 text-right pr-6">Дії</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sensors.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">Сенсорів не знайдено</td></tr> : null}
                {sensors.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-800 text-xs">{s.macAddress}</td>
                    <td className="p-4 text-xs text-slate-500 font-bold">{plants.find(p => p.id === s.plantId)?.name || 'Не прив\'язано'}</td>
                    <td className="p-4 text-xs text-slate-500">{s.sensorModel || '-'}</td>
                    <td className="p-4 text-xs text-slate-500 font-mono">{s.firmwareVersion || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {s.isActive ? 'Активний' : 'Вимкнений'}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button onClick={() => { setSensorForm(s); setEditingSensorId(s.id); setShowSensorForm(true); }} className="p-1 text-slate-400 hover:text-brand-600 mr-2 cursor-pointer transition-colors"><Edit2 className="h-4 w-4 inline" /></button>
                      <button onClick={() => handleDeleteSensor(s.id)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"><Trash2 className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: READINGS */}
      {activeTab === 'READINGS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <LineChart className="h-5 w-5 text-brand-600" />
                <span>Історія показників сенсорів (IoT Telemetry)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Перелік останніх логів, надісланих фізичними пристроями з офісу</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Метрика:</span>
              <select 
                value={selectedReadingType} 
                onChange={(e) => setSelectedReadingType(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 cursor-pointer"
              >
                <option value="ALL">Всі показники</option>
                <option value="SOIL_MOISTURE">Вологість ґрунту</option>
                <option value="AIR_TEMPERATURE">Температура повітря</option>
                <option value="AIR_HUMIDITY">Вологість повітря</option>
                <option value="LIGHT_INTENSITY">Освітленість</option>
                <option value="BATTERY_LEVEL">Заряд батареї</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-h-150 overflow-y-auto">
            <table className="w-full text-left text-sm relative">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 pl-6">Дата / Час запису</th>
                  <th className="p-4">Сенсор (MAC)</th>
                  <th className="p-4">Рослина</th>
                  <th className="p-4">Тип показника</th>
                  <th className="p-4 pr-6 text-right">Отримане значення</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReadings.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Показників за даним фільтром не знайдено</td></tr>
                ) : null}
                {filteredReadings.map((reading) => {
                  const currentSensor = sensors.find(s => s.id === reading.sensorId);
                  const currentPlant = plants.find(p => p.id === currentSensor?.plantId);

                  return (
                    <tr key={reading.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 text-xs font-mono text-slate-500">
                        {reading.recordedAt ? new Date(reading.recordedAt).toLocaleString('uk-UA') : '-'}
                      </td>
                      <td className="p-4 text-xs font-mono font-bold text-slate-700">
                        {currentSensor?.macAddress || 'Невідомий сенсор'}
                      </td>
                      <td className="p-4 text-xs text-slate-600 font-bold">
                        {currentPlant ? currentPlant.name : <span className="text-slate-300 italic font-normal">Не прив'язано</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getReadingIcon(reading.type)}
                          <span className="text-xs font-bold text-slate-700">{getReadingLabel(reading.type)}</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right font-black text-slate-800 text-sm">
                        {reading.value}
                        <span className="text-xs font-bold text-slate-400">{getReadingUnit(reading.type)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LOGS */}
      {activeTab === 'LOGS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-brand-600" /> Журнал дій (Care Logs)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">Всього записів: {logs.length}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-h-150 overflow-y-auto">
            <table className="w-full text-left text-sm relative">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr><th className="p-4 pl-6">Дата / Час</th><th className="p-4">Тип робіт</th><th className="p-4">Рослина</th><th className="p-4">Опис (Нотатки)</th><th className="p-4">Верифікація</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">Журнал порожній</td></tr> : null}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 text-xs font-mono text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString('uk-UA') : '-'}</td>
                    <td className="p-4"><span className="bg-brand-50 text-brand-700 text-[10px] font-bold uppercase px-2 py-1 rounded">{log.type}</span></td>
                    <td className="p-4 text-xs font-bold text-slate-700">{plants.find(p => p.id === log.plantId)?.name || log.plantId || '-'}</td>
                    <td className="p-4 text-xs text-slate-600 max-w-xs truncate" title={log.notes}>{log.notes || 'Без опису'}</td>
                    <td className="p-4">
                      {log.verifiedByScan ? <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> QR-скан</span> : <span className="text-xs text-slate-400">Ручне виконання</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}