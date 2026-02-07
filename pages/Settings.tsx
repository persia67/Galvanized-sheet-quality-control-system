import React, { useState, useEffect } from 'react';
import { Save, Download, Server, Cloud, Monitor, Info, CheckCircle, Play, HardDrive, AlertCircle, RefreshCw } from 'lucide-react';
import { AppSettings, DEFAULT_SETTINGS, RECOMMENDED_MODELS, ModelInfo } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [pullStatus, setPullStatus] = useState<string>('');
  const [localStatus, setLocalStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    checkLocalServer();
  }, []);

  const checkLocalServer = async () => {
    setLocalStatus('checking');
    try {
      const response = await fetch(settings.localEndpoint.replace('/generate', '/tags'), { method: 'GET' });
      if (response.ok) setLocalStatus('online');
      else setLocalStatus('offline');
    } catch {
      setLocalStatus('offline');
    }
  };

  const handleSave = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const pullModel = async (modelId: string) => {
    if (localStatus !== 'online') {
      alert('ابتدا نرم‌افزار Ollama را اجرا کنید.');
      return;
    }

    setPullingModel(modelId);
    setPullProgress(0);
    setPullStatus('در حال شروع دانلود...');

    try {
      const response = await fetch(settings.pullEndpoint, {
        method: 'POST',
        body: JSON.stringify({ name: modelId }),
      });

      if (!response.body) throw new Error('ReadableStream not supported');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.status === 'downloading' && data.total) {
              const percent = Math.round((data.completed / data.total) * 100);
              setPullProgress(percent);
              setPullStatus(`در حال دریافت: ${percent}%`);
            } else if (data.status === 'success') {
              setPullStatus('نصب با موفقیت انجام شد.');
              setSettings(prev => ({ ...prev, localModelName: modelId }));
              setTimeout(() => setPullingModel(null), 2000);
            } else {
              setPullStatus(data.status);
            }
          } catch (e) {
            console.error('Error parsing pull progress', e);
          }
        }
      }
    } catch (error) {
      console.error('Pull error:', error);
      setPullStatus('خطا در دانلود مدل');
      setTimeout(() => setPullingModel(null), 3000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">تنظیمات سیستم هوشمند</h2>
          <p className="text-slate-500 text-sm mt-1">مدیریت موتورهای پردازش و مدل‌های محلی</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition-all shadow-md font-bold"
        >
          <Save size={18} />
          ذخیره پیکربندی
        </button>
      </div>

      {saved && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-2 border border-green-200 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={18} />
          تنظیمات با موفقیت ذخیره شد.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Status & Engine */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Server size={20} className="text-brand-500" />
              وضعیت زیرساخت
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm text-slate-600">سرویس Ollama</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${localStatus === 'online' ? 'bg-green-500' : localStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <span className={`text-xs font-bold ${localStatus === 'online' ? 'text-green-600' : localStatus === 'offline' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {localStatus === 'online' ? 'متصل' : localStatus === 'offline' ? 'قطع اتصال' : 'درحال بررسی'}
                  </span>
                  <button onClick={checkLocalServer} className="p-1 hover:bg-slate-200 rounded transition-colors">
                    <RefreshCw size={12} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500">موتور فعال</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSettings({...settings, aiEngine: 'gemini'})}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      settings.aiEngine === 'gemini' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <Cloud size={24} />
                    <span className="text-xs font-bold">Cloud</span>
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, aiEngine: 'local'})}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      settings.aiEngine === 'local' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <Monitor size={24} />
                    <span className="text-xs font-bold">Offline</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Download size={20} />
              دریافت هسته مرکزی
            </h3>
            <p className="text-xs text-blue-200 leading-relaxed">
              برای استفاده آفلاین، ابتدا باید پلتفرم Ollama را روی سیستم خود نصب کنید. این نرم‌افزار به عنوان سرور مدل‌های هوش مصنوعی عمل می‌کند.
            </p>
            <a 
              href="https://ollama.com/download" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              دانلود برای ویندوز
            </a>
          </div>
        </div>

        {/* Model Manager */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <HardDrive size={20} className="text-brand-500" />
                مدیریت مدل‌های بینایی ماشین
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Ollama Ecosystem</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {RECOMMENDED_MODELS.map((model) => (
                <div 
                  key={model.id}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${
                    settings.localModelName === model.id ? 'border-brand-200 bg-brand-50/30' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800">{model.name}</h4>
                      <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{model.size}</span>
                      {settings.localModelName === model.id && (
                        <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">فعال</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{model.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Monitor size={10} /> RAM پیشنهادی: {model.recommendedVRAM}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {pullingModel === model.id ? (
                      <div className="w-40 space-y-2 text-left" dir="ltr">
                        <div className="flex justify-between text-[10px] font-mono text-brand-600">
                          <span>{pullStatus}</span>
                          <span>{pullProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-brand-500 h-full transition-all duration-300" 
                            style={{ width: `${pullProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => pullModel(model.id)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all"
                          title="نصب / بروزرسانی"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={() => setSettings({...settings, localModelName: model.id})}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            settings.localModelName === model.id 
                              ? 'bg-brand-600 text-white cursor-default' 
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {settings.localModelName === model.id ? 'انتخاب شده' : 'انتخاب مدل'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3">
              <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800 leading-relaxed">
                <p className="font-bold mb-1">نکته مهم در مورد مدل‌های محلی:</p>
                <p>مدل <strong>Moondream</strong> برای سیستم‌های معمولی و لپ‌تاپ‌های اداری بهترین گزینه است. برای دقت حداکثری در شناسایی عیوب بسیار ریز (مثل خراش‌های میکرونی)، مدل <strong>LLaVA</strong> پیشنهاد می‌شود که نیاز به کارت گرافیک سری RTX دارد.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Settings size={20} className="text-brand-500" />
              تنظیمات پیشرفته اتصال
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 px-1">آدرس سرور تولید (Generation)</label>
                <input 
                  type="text" 
                  value={settings.localEndpoint}
                  onChange={(e) => setSettings({...settings, localEndpoint: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 px-1">آدرس سرور دانلود (Pull)</label>
                <input 
                  type="text" 
                  value={settings.pullEndpoint}
                  onChange={(e) => setSettings({...settings, pullEndpoint: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;