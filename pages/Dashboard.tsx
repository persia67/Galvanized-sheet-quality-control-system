import React, { useEffect, useState } from 'react';
import { InspectionRecord, SteelGrade } from '../types';
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
  tableHeader: { padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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

  useEffect(() => {
    const saved = localStorage.getItem('qc_records');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  // Stats
  const total = records.length;
  const grade1 = records.filter(r => r.grade === SteelGrade.Grade1).length;
  const grade2 = records.filter(r => r.grade === SteelGrade.Grade2).length;
  const grade3 = records.filter(r => r.grade === SteelGrade.Grade3).length;

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
        <StatBox title="نرخ سلامت" val={`${total ? Math.round((grade1/total)*100) : 0}%`} sub="درجه ۱" icon={<Icons.CheckCircle size={24} />} />
        <StatBox title="عیب اصلی" val={pareto[0]?.[0] || '-'} sub="بیشترین تکرار" icon={<Icons.AlertOctagon size={24} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Quality Distribution (Linear Charts) */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>توزیع کیفی محصولات</h3>
          <div style={{ padding: '10px 0' }}>
            <div style={styles.progressRow}>
              <div style={styles.progressLabel}><span>درجه ۱ (ممتاز)</span><span>{grade1}</span></div>
              <div style={styles.track}><div style={styles.fill(total ? (grade1/total)*100 : 0, '#22c55e')}></div></div>
            </div>
            <div style={styles.progressRow}>
              <div style={styles.progressLabel}><span>درجه ۲ (معمولی)</span><span>{grade2}</span></div>
              <div style={styles.track}><div style={styles.fill(total ? (grade2/total)*100 : 0, '#eab308')}></div></div>
            </div>
            <div style={styles.progressRow}>
              <div style={styles.progressLabel}><span>درجه ۳ (ضایعات)</span><span>{grade3}</span></div>
              <div style={styles.track}><div style={styles.fill(total ? (grade3/total)*100 : 0, '#ef4444')}></div></div>
            </div>
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
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <span style={{ fontWeight: 'bold', color: '#334155' }}>آخرین رکوردهای ثبت شده</span>
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
            {records.slice(0, 10).map(r => (
              <tr key={r.id}>
                <td style={styles.td}>{new Date(r.timestamp).toLocaleTimeString('fa-IR')}</td>
                <td style={styles.td}>{r.batchId}</td>
                <td style={styles.td}>
                  <span style={{ 
                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: r.grade === SteelGrade.Grade1 ? '#dcfce7' : r.grade === SteelGrade.Grade2 ? '#fef9c3' : '#fee2e2',
                    color: r.grade === SteelGrade.Grade1 ? '#15803d' : r.grade === SteelGrade.Grade2 ? '#a16207' : '#b91c1c'
                  }}>
                    {r.grade}
                  </span>
                </td>
                <td style={styles.td}>{r.defects.map(d => d.type).join('، ') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;