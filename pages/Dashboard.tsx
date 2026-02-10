import React, { useEffect, useState, useRef } from 'react';
import { InspectionRecord, SteelGrade } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line 
} from 'recharts';
import { FileText, AlertOctagon, Layers, TrendingUp, Filter, ChevronDown, Check, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('qc_records');
    if (saved) {
      setRecords(JSON.parse(saved));
    }

    // Handle clicking outside of filter dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate Statistics
  const total = records.length;
  const grade1Count = records.filter(r => r.grade === SteelGrade.Grade1).length;
  const grade2Count = records.filter(r => r.grade === SteelGrade.Grade2).length;
  const grade3Count = records.filter(r => r.grade === SteelGrade.Grade3).length;

  const pieData = [
    { name: 'درجه ۱ (ممتاز)', value: grade1Count, color: '#22c55e' },
    { name: 'درجه ۲ (معمولی)', value: grade2Count, color: '#eab308' },
    { name: 'درجه ۳ (ضایعات)', value: grade3Count, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // All unique defect types for filter
  const allUniqueDefects = Array.from(new Set(records.flatMap(r => r.defects.map(d => d.type))));

  // Defect Pareto Data
  const defectCounts: Record<string, number> = {};
  records.forEach(r => {
    r.defects.forEach(d => {
      defectCounts[d.type] = (defectCounts[d.type] || 0) + 1;
    });
  });

  const paretoData = Object.entries(defectCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 defects

  // Trend Data Calculation
  const topDefects = paretoData.slice(0, 3).map(d => d.name);
  const trendColors = ['#ef4444', '#f59e0b', '#3b82f6'];

  const trendMap = new Map<string, any>();
  
  // Sort chronologically for trend
  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
  
  sortedRecords.forEach(r => {
    // Grouping by time (HH:mm)
    const timeKey = new Date(r.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    
    if (!trendMap.has(timeKey)) {
      const initObj: any = { time: timeKey };
      topDefects.forEach(d => initObj[d] = 0);
      trendMap.set(timeKey, initObj);
    }

    const entry = trendMap.get(timeKey);
    r.defects.forEach(d => {
      if (topDefects.includes(d.type)) {
        entry[d.type] = (entry[d.type] || 0) + 1;
      }
    });
  });
  
  const trendData = Array.from(trendMap.values()).slice(-15); // Show last 15 points

  // Filtered records for the table
  const filteredRecords = records.filter(record => {
    if (selectedDefects.length === 0) return true;
    return record.defects.some(d => selectedDefects.includes(d.type));
  });

  const toggleDefectFilter = (type: string) => {
    setSelectedDefects(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const StatsCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        <p className={`text-sm mt-2 ${color}`}>{sub}</p>
      </div>
      <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
        <Icon className={color} size={24} />
      </div>
    </div>
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">داشبورد کنترل کیفیت</h2>
        <p className="text-slate-500 mt-1">گزارش تجمعی خط تولید - شیفت جاری</p>
      </div>

      {total === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm">
          <p className="text-slate-400">داده‌ای برای نمایش وجود ندارد. لطفاً ابتدا بازرسی انجام دهید.</p>
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="کل ورق‌های تولیدی" 
              value={total} 
              sub="تعداد شیت‌های اسکن شده" 
              icon={Layers} 
              color="text-brand-600" 
            />
            <StatsCard 
              title="نرخ سلامت تولید" 
              value={`${Math.round((grade1Count / total) * 100)}%`} 
              sub="درصد ورق‌های درجه ۱" 
              icon={FileText} 
              color="text-green-600" 
            />
            <StatsCard 
              title="مهمترین عامل خرابی" 
              value={paretoData[0]?.name || '-'} 
              sub={paretoData[0] ? `${paretoData[0].count} مورد مشاهده` : ''} 
              icon={AlertOctagon} 
              color="text-red-600" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart: Grades */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">توزیع کیفیت محصولات</h3>
              <div className="h-80 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Pareto */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">نمودار پارتو عیوب (بیشترین تکرار)</h3>
              <div className="h-80 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paretoData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} name="تعداد تکرار" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart: Trend (Spans 2 columns) */}
            <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center justify-between mb-6 border-b pb-4">
                 <h3 className="text-lg font-bold text-slate-800">روند زمانی بروز ۳ عیب اصلی</h3>
                 <TrendingUp className="text-slate-400" />
               </div>
               {topDefects.length > 0 ? (
                 <div className="h-80 w-full" dir="ltr">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis dataKey="time" tick={{fontSize: 12, fill: '#64748b'}} />
                       <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#64748b'}} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }} 
                       />
                       <Legend verticalAlign="top" height={36} />
                       {topDefects.map((defect, index) => (
                         <Line 
                           key={defect}
                           type="monotone" 
                           dataKey={defect} 
                           stroke={trendColors[index % trendColors.length]} 
                           strokeWidth={3}
                           dot={{ r: 4, fill: trendColors[index % trendColors.length], strokeWidth: 2, stroke: '#fff' }}
                           activeDot={{ r: 6, strokeWidth: 0 }}
                         />
                       ))}
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                   اطلاعات کافی برای ترسیم روند وجود ندارد.
                 </div>
               )}
            </div>

          </div>

          {/* Detailed Table with Multi-Select Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800">لیست آخرین بازرسی‌ها</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Multi-Select Defect Filter */}
                <div className="relative" ref={filterRef}>
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-all ${
                      selectedDefects.length > 0 ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Filter size={16} />
                    <span>{selectedDefects.length > 0 ? `فیلتر عیوب (${selectedDefects.length})` : 'فیلتر بر اساس نوع عیب'}</span>
                    <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 overflow-hidden">
                      <div className="flex justify-between items-center p-2 border-b border-slate-50 mb-2">
                        <span className="text-xs font-bold text-slate-500">انتخاب عیوب</span>
                        {selectedDefects.length > 0 && (
                          <button 
                            onClick={() => setSelectedDefects([])}
                            className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                          >
                            پاک کردن همه
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {allUniqueDefects.length > 0 ? (
                          allUniqueDefects.map((defect: string) => (
                            <button
                              key={defect}
                              onClick={() => toggleDefectFilter(defect)}
                              className={`w-full text-right px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${
                                selectedDefects.includes(defect) ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <span>{defect}</span>
                              {selectedDefects.includes(defect) && <Check size={14} className="text-brand-600" />}
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">عیبی یافت نشد.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedDefects.length > 0 && (
                  <div className="flex items-center gap-1">
                    {selectedDefects.map((d: string) => (
                      <span key={d} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                        {d}
                        <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => toggleDefectFilter(d)} />
                      </span>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => { localStorage.removeItem('qc_records'); setRecords([]); setSelectedDefects([]); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  پاک کردن تاریخچه
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">زمان</th>
                    <th className="px-6 py-3">شناسه بچ</th>
                    <th className="px-6 py-3">درجه کیفی</th>
                    <th className="px-6 py-3">عیوب شناسایی شده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.slice(0, 20).map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-slate-600">
                          {new Date(record.timestamp).toLocaleTimeString('fa-IR')}
                        </td>
                        <td className="px-6 py-3">{record.batchId}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            record.grade === SteelGrade.Grade1 ? 'bg-green-100 text-green-700' :
                            record.grade === SteelGrade.Grade2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {record.grade}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {record.defects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {record.defects.map((d, i) => (
                                <span key={i} className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                                  d.severity === 'High' ? 'bg-red-50 border-red-100 text-red-600' : 
                                  d.severity === 'Medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(d.severity)}`}></span>
                                  {d.type}
                                </span>
                              ))}
                            </div>
                          ) : 'بدون عیب'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        رکوردی با فیلترهای انتخابی یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;