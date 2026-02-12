import React, { useEffect, useState } from 'react';
import { InspectionRecord, AppSettings, DEFAULT_SETTINGS } from '../types';
import { Icons } from '../components/Icons';

const styles = {
  page: { padding: '24px', paddingBottom: '80px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '4px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' },
  statsCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  chartContainer: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' },
  chartTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' },
  tableContainer: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  tableHeader: { padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as 'wrap', gap: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' as 'collapse' },
  th: { textAlign: 'right' as 'right', padding: '12px 24px', fontSize: '14px', color: '#64748b', fontWeight: '500' },
  td: { padding: '12px 24px', fontSize: '14px', borderTop: '1px solid #f1f5f9', color: '#334155' },
  
  // Custom CSS Bar Chart
  barChartBox: { display: 'flex', alignItems: 'flex-end', height: '200px', gap: '16px', paddingTop: '20px' },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: (height: number, color: string) => ({ width: '40px', height: `${height}%`, backgroundColor: color, borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }),
  barLabel: { marginTop: '8px', fontSize: '12px', color: '#64748b', textAlign: 'center' as 'center' },

  // Progress Bar for Grades
  progressRow: { marginBottom: '16px' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px', color: '#475569' },
  track: { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  fill: (width: number, color: string) => ({ height: '100%', width: `${width}%`, backgroundColor: color })
};

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  useEffect(() => {
    const saved = localStorage.getItem('qc_records');
    if (saved) setRecords(JSON.parse(saved));
    
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Stats
  const total = records.length;
  
  // Calculate Grade Counts Dynamically
  const gradeCounts: Record<string, number> = {};
  settings.customGrades.forEach(g => gradeCounts[g.name] = 0);
  records.forEach(r => {
    gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
  });

  // Simple heuristic for success rate (Assuming first grade defined is the 'Best')
  const bestGradeName = settings.customGrades.length > 0 ? settings.customGrades[0].name : 'Grade 1';
  const successCount = gradeCounts[bestGradeName] || 0;

  // Defect Pareto
  const defectCounts: Record<string, number> = {};
  records.forEach(r => r.defects.forEach(d => defectCounts[d.type] = (defectCounts[d.type] || 0) + 1));
  const pareto = Object.entries(defectCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDefectCount = pareto.length > 0 ? pareto[0][1] : 1;

  const handleDownloadCSV = () => {
    if (records.length === 0) {
      alert('داده‌ای برای دانلود وجود ندارد.');
      return;
    }

    const headers = ['Timestamp', 'Date', 'Time', 'Batch ID', 'Grade', 'Defects'];
    const rows = records.map(r => {
      const dateObj = new Date(r.timestamp);
      const defectsString = r.defects.map(d => `${d.type} (${d.severity})`).join('; ');
      
      return [
        r.timestamp,
        dateObj.toLocaleDateString('fa-IR'),
        dateObj.toLocaleTimeString('fa-IR'),
        r.batchId,
        r.grade,
        `"${defectsString.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QC_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedRecords = records.filter(r => {
    if (severityFilter === 'All') return true;
    return r.defects.some(d => d.severity === severityFilter);
  });

  const getGradeColor = (grade: string) => {
      const g = grade.toLowerCase();
      if(g.includes('1') || g.includes('prime') || g.includes('good')) return '#22c55e';
      if(g.includes('3') || g.includes('scrap') || g.includes('reject')) return '#ef4444';
      return '#eab308';
  };
  
  const getGradeBg = (grade: string) => {
      const g = grade.toLowerCase();
      if(g.includes('1') || g.includes('prime') || g.includes('good')) return '#dcfce7';
      if(g.includes('3') || g.includes('scrap') || g.includes('reject')) return '#fee2e2';
      return '#fef9c3';
  };
  
  const getGradeTextColor = (grade: string) => {
      const g = grade.toLowerCase();
      if(g.includes('1') || g.includes('prime') || g.includes('good')) return '#15803d';
      if(g.includes('3') || g.includes('scrap') || g.includes('reject')) return '#b91c1c';
      return '#a16207';
  };

  const StatBox = ({ title, val, sub, icon }: any) => (
    <div style={styles.statsCard}>
      <div>
        <p style={{ color: '#64748b', marginBottom: '4px', fontSize: '14px' }}>{title}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{val}</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{sub}</p>
      </div>
      <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', color: '#0284c7' }}>
        {icon}
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>داشبورد کنترل کیفیت</h2>
        <p style={styles.subtitle}>گزارش تحلیلی خط تولید (CSS Charts)</p>
      </div>

      <div style={styles.cardGrid}>
        <StatBox title="تولید کل" val={total} sub="شیت" icon={<Icons.Layers size={24} />} />
        <StatBox title="نرخ سلامت" val={`${total ? Math.round((successCount/total)*100) : 0}%`} sub={`تعداد ${bestGradeName}`} icon={<Icons.CheckCircle size={24} />} />
        <StatBox title="عیب اصلی" val={pareto[0]?.[0] || '-'} sub="بیشترین تکرار" icon={<Icons.AlertOctagon size={24} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Quality Distribution (Dynamic Linear Charts) */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>توزیع کیفی محصولات</h3>
          <div style={{ padding: '10px 0' }}>
            {settings.customGrades.map(g => {
                const count = gradeCounts[g.name] || 0;
                return (
                    <div key={g.id} style={styles.progressRow}>
                    <div style={styles.progressLabel}><span>{g.name}</span><span>{count}</span></div>
                    <div style={styles.track}><div style={styles.fill(total ? (count/total)*100 : 0, getGradeColor(g.name))}></div></div>
                    </div>
                )
            })}
          </div>
        </div>

        {/* Pareto Chart (CSS Bar Chart) */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>فراوانی عیوب (پارتو)</h3>
          {pareto.length > 0 ? (
            <div style={styles.barChartBox}>
              {pareto.map(([name, count]) => (
                <div key={name} style={styles.barCol}>
                  <div style={styles.bar((count / maxDefectCount) * 100, '#3b82f6')} title={`${count}`}></div>
                  <span style={styles.barLabel}>{name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>داده‌ای موجود نیست</div>
          )}
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
             <span style={{ fontWeight: 'bold', color: '#334155' }}>آخرین رکوردهای ثبت شده</span>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}><Icons.Filter size={14} color="#64748b" /></div>
                {(['All', 'High', 'Medium', 'Low'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    style={{
                      border: 'none',
                      backgroundColor: severityFilter === sev ? 'white' : 'transparent',
                      color: severityFilter === sev ? '#0f172a' : '#64748b',
                      fontSize: '12px',
                      fontWeight: severityFilter === sev ? 'bold' : 'normal',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: severityFilter === sev ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {sev === 'All' ? 'همه' : sev}
                  </button>
                ))}
             </div>

             <button onClick={handleDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', color: '#0284c7', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe' }}>
               <Icons.Download size={16} /> دانلود گزارش (CSV)
             </button>
           </div>
           <button onClick={() => { localStorage.removeItem('qc_records'); setRecords([]); }} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>پاکسازی داده‌ها</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>زمان</th>
              <th style={styles.th}>شناسه بچ</th>
              <th style={styles.th}>درجه</th>
              <th style={styles.th}>عیوب</th>
            </tr>
          </thead>
          <tbody>
            {displayedRecords.length > 0 ? displayedRecords.slice(0, 50).map(r => (
              <tr key={r.id}>
                <td style={styles.td}>{new Date(r.timestamp).toLocaleTimeString('fa-IR')}</td>
                <td style={styles.td}>{r.batchId}</td>
                <td style={styles.td}>
                  <span style={{ 
                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: getGradeBg(r.grade),
                    color: getGradeTextColor(r.grade)
                  }}>
                    {r.grade}
                  </span>
                </td>
                <td style={styles.td}>{r.defects.map(d => d.type).join('، ') || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  رکوردی با این فیلتر یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;