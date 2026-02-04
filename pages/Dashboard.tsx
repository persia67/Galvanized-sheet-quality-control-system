import React, { useEffect, useState } from 'react';
import { InspectionRecord, SteelGrade } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { FileText, AlertOctagon, Layers } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<InspectionRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('qc_records');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
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

          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">لیست آخرین بازرسی‌ها</h3>
              <button 
                onClick={() => { localStorage.removeItem('qc_records'); setRecords([]); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                پاک کردن تاریخچه
              </button>
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
                  {records.slice(0, 10).map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
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
                        {record.defects.length > 0 ? record.defects.map(d => d.type).join('، ') : 'بدون عیب'}
                      </td>
                    </tr>
                  ))}
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