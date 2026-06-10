import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { speciesService } from '../../api/services';
import { 
  BookOpen, PlusCircle, Edit2, Trash2, Save, X, 
  AlertCircle, Droplet, Thermometer, Sun, CalendarClock, Leaf, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PlantSpecies } from '../../types';

export default function PlantSpeciesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const hasAccess = ['ADMIN', 'FLORIST', 'OFFICE_MANAGER'].includes(user?.role || '');

  const [species, setSpecies] = useState<PlantSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Стан для форми
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState: Partial<PlantSpecies> = {
    scientificName: '', commonName: '', description: '',
    minSoilMoisture: 20, maxSoilMoisture: 60,
    minTemperature: 18, maxTemperature: 25,
    minLightLux: 500, maxLightLux: 2000,
    wateringFrequencyDays: 7, fertilizingFrequencyDays: 30
  };
  
  const [formData, setFormData] = useState<Partial<PlantSpecies>>(initialFormState);

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await speciesService.getAll().catch((err) => {
        console.warn("Помилка завантаження видів з сервера, використовуються фолбек-дані:", err.message);
        return { data: null };
      });
      
      if (res.data && res.data.length > 0) {
        setSpecies(res.data);
      } else if (res.data !== null) {
        setSpecies([]);
      } 
      
    } catch (err) {
      console.error("Глобальна помилка завантаження видів:", err);
      setError("Не вдалося завантажити довідник видів.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) fetchSpecies();
  }, [hasAccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    const parseNum = (val: any) => (val === undefined || val === null || val === '') ? undefined : Number(val);

    const payload: any = {
      scientificName: formData.scientificName,
      commonName: formData.commonName,
      description: formData.description || undefined,
      minSoilMoisture: parseNum(formData.minSoilMoisture),
      maxSoilMoisture: parseNum(formData.maxSoilMoisture),
      minTemperature: parseNum(formData.minTemperature),
      maxTemperature: parseNum(formData.maxTemperature),
      minLightLux: parseNum(formData.minLightLux),
      maxLightLux: parseNum(formData.maxLightLux),
      wateringFrequencyDays: parseNum(formData.wateringFrequencyDays),
      fertilizingFrequencyDays: parseNum(formData.fertilizingFrequencyDays),
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    try {
      if (editingId) {
        const res = await speciesService.update(editingId, payload);
        setSpecies(prev => prev.map(s => s.id === editingId ? { ...s, ...(res.data || payload) } as PlantSpecies : s));
      } else {
        const res = await speciesService.create(payload);
        setSpecies(prev => [...prev, res.data as PlantSpecies]);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData(initialFormState);
    } catch (err: any) {
      console.error("Помилка збереження виду рослини:", err);
      const errorData = err.response?.data;
      let errorMessage = "Не вдалося зберегти дані виду. Перевірте з'єднання.";
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = `Помилка валідації: ${errorData.errors.map((e: any) => `[${e.path?.join('.') || 'Поле'}] ${e.message}`).join('; ')}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (sp: PlantSpecies) => {
    setFormData(sp);
    setEditingId(sp.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей вид з довідника?')) return;
    try {
      await speciesService.delete(id);
      setSpecies(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error("Помилка видалення:", err);
      alert(err.response?.data?.message || "Не вдалося видалити вид. Можливо, він вже використовується.");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Доступ заборонено</h2>
        <p className="text-slate-500 mt-2">Ваша роль не має доступу до керування видами рослин.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 text-brand-600 font-bold hover:underline">На головну</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand-600"></div>
        <p className="text-xs text-slate-400 font-bold">Завантаження довідника...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Довідник видів рослин</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Встановіть ідеальні умови (норми) для IoT-сенсорів офісу</p>
          </div>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setFormData(initialFormState); setEditingId(null); setShowForm(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Новий вид</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 animate-fadeIn">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Форма створення / редагування */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-brand-200 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-500"></div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-brand-500" />
              {editingId ? 'Редагування виду' : 'Створення нового виду'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Базова інформація</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Назва (звичайна) <span className="text-red-500">*</span></label>
                <input required type="text" name="commonName" value={formData.commonName || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Монстера" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Наукова назва (Scientific Name) <span className="text-red-500">*</span></label>
                <input required type="text" name="scientificName" value={formData.scientificName || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Monstera deliciosa" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Опис та особливості</label>
                <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none" placeholder="Особливості догляду..." />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Ідеальні норми для сенсорів</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><Droplet className="h-3 w-3 text-blue-500"/> Вологість Мін (%) <span className="text-red-500">*</span></label>
                  <input required type="number" name="minSoilMoisture" value={formData.minSoilMoisture === undefined ? '' : formData.minSoilMoisture} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><Droplet className="h-3 w-3 text-blue-500"/> Вологість Макс (%) <span className="text-red-500">*</span></label>
                  <input required type="number" name="maxSoilMoisture" value={formData.maxSoilMoisture === undefined ? '' : formData.maxSoilMoisture} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><Thermometer className="h-3 w-3 text-orange-500"/> Темп. Мін (°C)</label>
                  <input type="number" name="minTemperature" value={formData.minTemperature === undefined ? '' : formData.minTemperature} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><Thermometer className="h-3 w-3 text-orange-500"/> Темп. Макс (°C)</label>
                  <input type="number" name="maxTemperature" value={formData.maxTemperature === undefined ? '' : formData.maxTemperature} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><Sun className="h-3 w-3 text-amber-500"/> Світло Мін (Lx)</label>
                  <input type="number" name="minLightLux" value={formData.minLightLux === undefined ? '' : formData.minLightLux} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><Sun className="h-3 w-3 text-amber-500"/> Світло Макс (Lx)</label>
                  <input type="number" name="maxLightLux" value={formData.maxLightLux === undefined ? '' : formData.maxLightLux} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><CalendarClock className="h-3 w-3 text-emerald-600"/> Полив (днів)</label>
                  <input type="number" name="wateringFrequencyDays" value={formData.wateringFrequencyDays === undefined ? '' : formData.wateringFrequencyDays} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Напр. 7" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><CalendarClock className="h-3 w-3 text-emerald-600"/> Добрива (днів)</label>
                  <input type="number" name="fertilizingFrequencyDays" value={formData.fertilizingFrequencyDays === undefined ? '' : formData.fertilizingFrequencyDays} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Напр. 30" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer">
              Скасувати
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-70 cursor-pointer">
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{editingId ? 'Зберегти зміни' : 'Створити вид'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Список видів */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {species.map(sp => (
          <div key={sp.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-brand-200 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight">{sp.commonName}</h3>
                  <p className="text-xs font-mono text-slate-400 italic mt-0.5">{sp.scientificName}</p>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(sp)} className="p-1.5 text-slate-400 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer" title="Редагувати">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(sp.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Видалити">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {sp.description || 'Немає детального опису для цього виду.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-lg">
                <Droplet className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-600">{sp.minSoilMoisture}% - {sp.maxSoilMoisture}%</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-lg">
                <Thermometer className="h-3 w-3 text-orange-500" />
                <span className="text-[10px] font-bold text-slate-600">{sp.minTemperature ?? '--'}° - {sp.maxTemperature ?? '--'}°C</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-lg">
                <Sun className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-600">{sp.minLightLux ?? '--'} - {sp.maxLightLux ?? '--'} Lx</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-lg">
                <CalendarClock className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-slate-600">Вода: раз у {sp.wateringFrequencyDays ?? '--'} дн.</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && species.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Leaf className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-600">Довідник порожній</h3>
          <p className="text-sm text-slate-400 mt-1">Додайте перший вид рослини, щоб встановити норми для сенсорів.</p>
        </div>
      )}

    </div>
  );
}