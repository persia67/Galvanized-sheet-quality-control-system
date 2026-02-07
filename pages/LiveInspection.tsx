import React, { useState, useEffect } from 'react';
import CameraView from '../components/CameraView';
import { analyzeSteelFrame } from '../services/aiService';
import { InspectionRecord, SteelGrade, AppSettings, DEFAULT_SETTINGS } from '../types';
import { AlertTriangle, CheckCircle, XCircle, Loader2, Activity, Camera, Monitor, Cloud } from 'lucide-react';

const LiveInspection: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [lastRecord, setLastRecord] = useState<InspectionRecord | null>(null);
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('qc_records');
    if (saved) {
      setRecords(JSON.parse(saved).slice(0, 50));
    }
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleCapture = async (imageSrc: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSteelFrame(imageSrc);
      const newRecord: InspectionRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: imageSrc,
        grade: result.grade as SteelGrade,
        defects: result.defects,
        confidence: result.confidence,
        batchId: `B-${new Date().getHours()}`
      };

      setLastRecord(newRecord);
      const updatedRecords = [newRecord, ...records].slice(0, 100);
      setRecords(updatedRecords);
      localStorage.setItem('qc_records', JSON.stringify(updatedRecords));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade: SteelGrade) => {
    switch (grade) {
      case SteelGrade.Grade1: return 'text-green-600 bg-green-50 border-green-200';
      case SteelGrade.Grade2: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case SteelGrade.Grade3: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ایستگاه بازرسی خط ۲</h2>
          <p className="text-slate-500 mt-1">مانیتورینگ لحظه‌ای عیوب سطحی ورق</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
            settings.aiEngine === 'local' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-brand-50 text-brand-600 border-brand-200'
          }`}>
            {settings.aiEngine === 'local' ? <Monitor size={14} /> : <Cloud size={14} />}
            <span>موتور: {settings.aiEngine === 'local' ? 'آفلاین (Local)' : 'ابری (Gemini)'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-white px-3 py-1 rounded-full shadow-sm text-slate-600 border border-slate-100">
            <Activity size={16} className="text-brand-500" />
            <span>نرخ تولید: ۴۵ متر/دقیقه</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CameraView 
            onCapture={handleCapture} 
            isAnalyzing={isAnalyzing} 
            autoMode={autoMode} 
            setAutoMode={setAutoMode}
          />

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">آخرین بررسی‌ها</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {records.slice(0, 6).map((rec) => (
                <div key={rec.id} className="min-w-[100px] flex flex-col items-center">
                  <div className={`w-24 h-16 rounded-lg overflow-hidden border-2 relative ${
                    rec.grade === SteelGrade.Grade1 ? 'border-green-400' : 
                    rec.grade === SteelGrade.Grade2 ? 'border-yellow-400' : 'border-red-400'
                  }`}>
                    <img src={rec.imageUrl} alt="scan" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] mt-1 font-bold text-slate-600">
                    {new Date(rec.timestamp).toLocaleTimeString('fa-IR')}
                  </span>
                </div>
              ))}
              {records.length === 0 && <p className="text-sm text-slate-400 py-4">هنوز رکوردی ثبت نشده است.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {isAnalyzing ? (
            <div className="h-full min-h-[400px] bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-brand-600 animate-pulse">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold text-lg">تحلیل هوشمند تصویر...</p>
              <p className="text-sm text-slate-400 mt-2">{settings.aiEngine === 'local' ? 'Local AI Processing' : 'Gemini AI Processing'}</p>
            </div>
          ) : lastRecord ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden h-full">
              <div className={`p-6 border-b ${getGradeColor(lastRecord.grade)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm opacity-80 font-medium">نتیجه ارزیابی</span>
                    <h3 className="text-3xl font-extrabold mt-1">{lastRecord.grade.split('(')[0]}</h3>
                    <p className="text-sm mt-1 opacity-90">{lastRecord.grade.split('(')[1]?.replace(')', '')}</p>
                  </div>
                  {lastRecord.grade === SteelGrade.Grade1 ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">عیوب شناسایی شده</h4>
                  {lastRecord.defects.length > 0 ? (
                    <div className="space-y-3">
                      {lastRecord.defects.map((defect, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <div className="flex justify-between w-full gap-8">
                              <span className="font-bold text-slate-800">{defect.type}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                defect.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                defect.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {defect.severity === 'High' ? 'شدید' : defect.severity === 'Medium' ? 'متوسط' : 'خفیف'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{defect.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-green-50 rounded-lg text-green-700 border border-green-100">
                      <CheckCircle className="mx-auto mb-2" size={24} />
                      <p>هیچ عیب قابل توجهی یافت نشد.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">اطمینان هوش مصنوعی</span>
                    <span className="font-bold text-slate-800">{lastRecord.confidence || 95}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${lastRecord.confidence || 95}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Camera size={48} className="mb-4 opacity-50" />
              <p>تصویری تحلیل نشده است.</p>
              <p className="text-sm mt-2">دوربین را فعال کنید یا عکس بگیرید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveInspection;