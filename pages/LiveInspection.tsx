import React, { useState, useEffect } from 'react';
import CameraView from '../components/CameraView';
import { analyzeSteelFrame } from '../services/aiService';
import { InspectionRecord, AppSettings, DEFAULT_SETTINGS } from '../types';
import { Icons } from '../components/Icons';

const styles = {
  page: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '4px', fontSize: '14px' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' },
  mainCol: { gridColumn: 'span 8' },
  sideCol: { gridColumn: 'span 4' },
  recentBox: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginTop: '16px' },
  recentTitle: { fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' },
  scrollRow: { display: 'flex', gap: '12px', overflowX: 'auto' as 'auto', paddingBottom: '8px' },
  resultCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', height: '100%' },
  resultHeader: (color: string) => ({ padding: '24px', borderBottom: '1px solid #f1f5f9', backgroundColor: color, color: '#334155' }),
  gradeBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  gradeTitle: { fontSize: '30px', fontWeight: '800', margin: '4px 0' },
  defectList: { padding: '24px' },
  defectItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '12px' },
  emptyState: { height: '100%', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '32px' }
};

const LiveInspection: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [lastRecord, setLastRecord] = useState<InspectionRecord | null>(null);
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('qc_records');
    if (saved) setRecords(JSON.parse(saved).slice(0, 50));
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const handleCapture = async (imageSrc: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSteelFrame(imageSrc);
      const newRecord: InspectionRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: imageSrc,
        grade: result.grade,
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

  // Heuristic for color coding based on grade name
  const getGradeBg = (grade: string) => {
    const g = grade.toLowerCase();
    if (g.includes('1') || g.includes('one') || g.includes('prime') || g.includes('good')) return '#f0fdf4'; // green-50
    if (g.includes('3') || g.includes('three') || g.includes('scrap') || g.includes('reject')) return '#fef2f2'; // red-50
    return '#fefce8'; // yellow-50 (default/medium)
  };

  const getBorderColor = (grade: string) => {
    const g = grade.toLowerCase();
    if (g.includes('1') || g.includes('one') || g.includes('prime')) return '#4ade80';
    if (g.includes('3') || g.includes('three') || g.includes('scrap')) return '#f87171';
    return '#facc15';
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>ایستگاه بازرسی خط ۲</h2>
          <p style={styles.subtitle}>مانیتورینگ لحظه‌ای عیوب سطحی ورق (Local AI)</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={styles.statusBadge}>
            <Icons.HardDrive size={16} />
            <span>WebGPU Ready</span>
          </div>
          <div style={styles.statusBadge}>
            <Icons.Activity size={16} />
            <span>نرخ تولید: ۴۵ متر/دقیقه</span>
          </div>
        </div>
      </header>

      <div style={styles.grid}>
        <div style={styles.mainCol}>
          <CameraView 
            onCapture={handleCapture} 
            isAnalyzing={isAnalyzing} 
            autoMode={autoMode} 
            setAutoMode={setAutoMode}
          />

          <div style={styles.recentBox}>
            <h3 style={styles.recentTitle}>آخرین بررسی‌ها</h3>
            <div style={styles.scrollRow}>
              {records.slice(0, 6).map((rec) => (
                <div key={rec.id} style={{ minWidth: '100px', textAlign: 'center' }}>
                  <div style={{ width: '100px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${getBorderColor(rec.grade)}` }}>
                    <img src={rec.imageUrl} alt="scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold', color: '#475569', display: 'block' }}>
                    {new Date(rec.timestamp).toLocaleTimeString('fa-IR')}
                  </span>
                </div>
              ))}
              {records.length === 0 && <p style={{ fontSize: '14px', color: '#94a3b8' }}>هنوز رکوردی ثبت نشده است.</p>}
            </div>
          </div>
        </div>

        <div style={styles.sideCol}>
          {isAnalyzing ? (
            <div style={{ ...styles.resultCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <div style={{ animation: 'spin 1s linear infinite' }}><Icons.Loader2 size={48} /></div>
              <p style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '16px' }}>تحلیل هوشمند تصویر...</p>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>WebGPU Processing</p>
            </div>
          ) : lastRecord ? (
            <div style={styles.resultCard}>
              <div style={styles.resultHeader(getGradeBg(lastRecord.grade))}>
                <div style={styles.gradeBox}>
                  <div>
                    <span style={{ fontSize: '14px', opacity: 0.8, fontWeight: '500' }}>نتیجه ارزیابی</span>
                    <h3 style={styles.gradeTitle}>{lastRecord.grade}</h3>
                    <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>{settings.customGrades.find(g => g.name === lastRecord.grade)?.description || ''}</p>
                  </div>
                  {(lastRecord.grade.includes('1') || lastRecord.grade.includes('Good')) ? <Icons.CheckCircle size={40} color="#16a34a" /> : <Icons.AlertTriangle size={40} color="#ca8a04" />}
                </div>
              </div>

              <div style={styles.defectList}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b', marginBottom: '12px' }}>عیوب شناسایی شده</h4>
                  {lastRecord.defects.length > 0 ? (
                    <div>
                      {lastRecord.defects.map((defect, idx) => (
                        <div key={idx} style={styles.defectItem}>
                          <div style={{ color: '#ef4444' }}><Icons.XCircle size={18} /></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{defect.type}</span>
                              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>{defect.severity}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{defect.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#15803d', textAlign: 'center', border: '1px solid #dcfce7' }}>
                      <p style={{ margin: 0, fontWeight: '500' }}>هیچ عیب قابل توجهی یافت نشد.</p>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>اطمینان هوش مصنوعی</span>
                    <span style={{ fontWeight: 'bold' }}>{lastRecord.confidence || 95}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                    <div style={{ width: `${lastRecord.confidence || 95}%`, height: '100%', backgroundColor: '#0ea5e9', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={{ opacity: 0.5, marginBottom: '16px' }}><Icons.Camera size={48} /></div>
              <p style={{ margin: 0, fontWeight: '500' }}>تصویری تحلیل نشده است.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveInspection;