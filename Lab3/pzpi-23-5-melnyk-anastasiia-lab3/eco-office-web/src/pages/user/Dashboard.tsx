import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  locationService, plantService, sensorService, readingService, taskService 
} from '../../api/services';
import { 
  Sparkles, Droplet, RefreshCw, Thermometer, Wind, AlertCircle, Sun, Battery, 
  MapPin, Layers, ChevronDown, ChevronUp, Info, ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Location, Plant, Sensor, SensorReading } from '../../types';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const currentRole = user?.role || 'CLEANER';

  const [locations, setLocations] = useState<Location[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [activeTasksCount, setActiveTasksCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSensorsAccess = currentRole === 'ADMIN' || currentRole === 'FLORIST' || currentRole === 'OFFICE_MANAGER';
  const [expandedFloors, setExpandedFloors] = useState<Record<number, boolean>>({});

  const fetchBackendData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsFetching(true);
      else setLoading(true);
      setError(null);

      const [locsRes, plantsRes, sensorsRes, readingsRes, tasksRes] = await Promise.all([
        locationService.getAll().catch(() => ({ data: [] })),
        plantService.getAll().catch(() => ({ data: [] })),
        sensorService.getAll().catch(() => ({ data: [] })),
        readingService.getAll().catch(() => ({ data: [] })),
        taskService.getAll().catch(() => ({ data: [] }))
      ]);

      setLocations(locsRes.data || []);
      setPlants(plantsRes.data || []);
      setSensors(sensorsRes.data || []);
      setReadings(readingsRes.data || []);

      if (tasksRes.data) {
        const pending = tasksRes.data.filter((t) => 
          (t.requiredRole === currentRole || currentRole === 'ADMIN') && t.status !== 'COMPLETED'
        );
        setActiveTasksCount(pending.length);
      }

    } catch (err) {
      console.error("Помилка завантаження даних робочого столу:", err);
      setError("Помилка синхронізації з БД.");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => { 
    fetchBackendData(); 
  }, [currentRole]);

  const getLatestReadingForSensor = (sensorId: string, type: SensorReading['type']) => {
    const sensorReadings = readings.filter(r => r.sensorId === sensorId && r.type === type);
    if (sensorReadings.length === 0) return null;
    return sensorReadings.sort((a, b) => {
      const dateA = a.recordedAt ? new Date(a.recordedAt).getTime() : 0;
      const dateB = b.recordedAt ? new Date(b.recordedAt).getTime() : 0;
      return dateA - dateB;
    })[sensorReadings.length - 1];
  };

  const toggleFloor = (floor: number) => setExpandedFloors(prev => ({ ...prev, [floor]: !prev[floor] }));

  const floorsMap: Record<number, Location[]> = {};
  locations.forEach(loc => {
    const floor = loc.floorNumber ?? 1;
    if (!floorsMap[floor]) floorsMap[floor] = [];
    floorsMap[floor].push(loc);
  });

  const sortedFloors = Object.keys(floorsMap).map(Number).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand-600"></div>
        <p className="text-xs text-slate-400 font-bold">Синхронізація з сервером...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      <div className="bg-linear-to-r from-emerald-600 to-teal-850 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
            <Sparkles className="h-3 w-3 text-brand-300" />
            <span>Посада: {currentRole}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">Еко-моніторинг офісу 🌿</h2>
          <p className="text-emerald-100 text-sm max-w-xl">Слідкуйте за станом середовища офісних локацій.</p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
          {/* Віджет завдань */}
          <div 
            onClick={() => navigate('/tasks')}
            className="bg-white/10 border border-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all flex items-center justify-between gap-6"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Завдання на зміну</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black leading-none">{activeTasksCount}</span>
                <span className="text-sm font-medium text-emerald-400">активних</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <button 
            onClick={() => fetchBackendData(true)}
            disabled={isFetching}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-50 transition-all text-xs font-bold rounded-xl border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Оновити дані</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {hasSensorsAccess ? (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Карта приміщень та логів сенсорів</span>
          </h3>

          <div className="space-y-4">
            {sortedFloors.length === 0 && !isFetching && (
              <div className="bg-white border border-slate-150 rounded-2xl p-8 text-center text-slate-500 text-sm font-semibold">
                У системі ще не створено жодної локації.
              </div>
            )}

            {sortedFloors.map((floorNum) => {
              const isExpanded = expandedFloors[floorNum] !== false;
              const floorLocs = floorsMap[floorNum];

              return (
                <div key={floorNum} className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
                  <div 
                    onClick={() => toggleFloor(floorNum)}
                    className="bg-slate-50/70 border-b border-slate-150 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-sm">{floorNum}</div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">{floorNum}-й поверх будівлі</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">Локацій: {floorLocs.length}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>

                  {isExpanded && (
                    <div className="p-6 divide-y divide-slate-100">
                      {floorLocs.map((loc) => {
                        const locationPlants = plants.filter(p => p.locationId === loc.id);

                        return (
                          <div key={loc.id} className="py-5 first:pt-0 last:pb-0 space-y-4">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              <div>
                                <h5 className="text-sm font-extrabold text-slate-800">{loc.name}</h5>
                                {loc.description && <p className="text-xs text-slate-400 font-medium">{loc.description}</p>}
                              </div>
                            </div>

                            {locationPlants.length === 0 ? (
                              <p className="text-xs text-slate-400 font-semibold italic pl-6">У цьому приміщенні немає рослин.</p>
                            ) : (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pl-6">
                                {locationPlants.map((plant) => {
                                  const plantSensor = sensors.find(s => s.plantId === plant.id);
                                  const sensorId = plantSensor?.id || '';
                                  
                                  const moisture = getLatestReadingForSensor(sensorId, 'SOIL_MOISTURE');
                                  const temp = getLatestReadingForSensor(sensorId, 'AIR_TEMPERATURE');
                                  const humidity = getLatestReadingForSensor(sensorId, 'AIR_HUMIDITY');
                                  const light = getLatestReadingForSensor(sensorId, 'LIGHT_INTENSITY');
                                  const battery = getLatestReadingForSensor(sensorId, 'BATTERY_LEVEL');

                                  return (
                                    <div key={plant.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4 hover:border-slate-200 transition-all">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h6 className="text-xs font-bold text-slate-700">{plant.name || 'Офісна рослина'}</h6>
                                          <p className="text-[9px] font-mono text-slate-400 font-semibold uppercase">{plant.qrCodeId}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                                            plant.healthStatus === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            plant.healthStatus === 'NEEDS_ATTENTION' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                                            'bg-red-50 text-red-700 border-red-100 animate-pulse'
                                          }`}>
                                            {plant.healthStatus}
                                          </span>
                                          
                                          <Link 
                                            to={`/plants/${plant.id}`}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-700 transition-colors bg-white px-2 py-1 rounded shadow-sm border border-slate-100"
                                          >
                                            <span>Детальніше</span>
                                            <ArrowRight className="h-3 w-3" />
                                          </Link>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100/60">
                                        <div className="text-center space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 block uppercase">Ґрунт</span>
                                          <div className="flex items-center justify-center gap-0.5 text-xs font-extrabold text-blue-600">
                                            <Droplet className="h-3 w-3 shrink-0" />
                                            <span>{moisture ? `${moisture.value}%` : '--'}</span>
                                          </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 block uppercase">Темп.</span>
                                          <div className="flex items-center justify-center gap-0.5 text-xs font-extrabold text-orange-600">
                                            <Thermometer className="h-3 w-3 shrink-0" />
                                            <span>{temp ? `${temp.value}°C` : '--'}</span>
                                          </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 block uppercase">Повітря</span>
                                          <div className="flex items-center justify-center gap-0.5 text-xs font-extrabold text-teal-600">
                                            <Wind className="h-3 w-3 shrink-0" />
                                            <span>{humidity ? `${humidity.value}%` : '--'}</span>
                                          </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 block uppercase">Світло</span>
                                          <div className="flex items-center justify-center gap-0.5 text-xs font-extrabold text-amber-500">
                                            <Sun className="h-3 w-3 shrink-0" />
                                            <span>{light ? `${light.value}Lx` : '--'}</span>
                                          </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 block uppercase">Заряд</span>
                                          <div className="flex items-center justify-center gap-0.5 text-xs font-extrabold text-slate-600">
                                            <Battery className="h-3 w-3 shrink-0" />
                                            <span>{battery ? `${battery.value}%` : '--'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-slate-50 text-slate-400 rounded-xl">
            <Info className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Клінінг-моніторинг</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed mb-4">
              Ваш профіль налаштовано для підтримки чистоти та порядку в офісних просторах.
            </p>
            <button 
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg hover:bg-brand-100 transition-colors"
            >
              Перейти до моїх завдань
            </button>
          </div>
        </div>
      )}

    </div>
  );
}