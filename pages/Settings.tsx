import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { AppSettings, DEFAULT_SETTINGS, DefectTypeConfig, GradeConfig } from '../types';
import { reloadEngine } from '../services/aiService';

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  section: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  infoBox: { backgroundColor: '#eff6ff', border: '1px solid #dbeafe', padding: '16px', borderRadius: '8px', color: '#1e40af', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' },
  modelCard: { border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' },
  listContainer: { display: 'flex', flexDirection: 'column' as 'column', gap: '12px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' },
  inputGroup: { display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', marginTop: '16px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px' },
  input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' },
  addBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer' },
  deleteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer' }
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Form states for new items
  const [newDefectName, setNewDefectName] = useState('');
  const [newDefectDesc, setNewDefectDesc] = useState('');
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeDesc, setNewGradeDesc] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure backward compatibility by merging with default if keys are missing
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    alert('تنظیمات ذخیره شد');
  };

  const handleLoadModel = async () => {
    setIsDownloading(true);
    setDownloadProgress('Starting WebGPU Engine...');
    try {
      await reloadEngine((progress) => {
        setDownloadProgress(progress.text);
      });
      setDownloadProgress('مدل با موفقیت روی حافظه مرورگر بارگذاری شد.');
    } catch (e) {
      setDownloadProgress('خطا در بارگذاری مدل.');
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const addDefect = () => {
    if (!newDefectName || !newDefectDesc) return;
    const newItem: DefectTypeConfig = { id: Date.now().toString(), name: newDefectName, description: newDefectDesc };
    setSettings(prev => ({ ...prev, customDefects: [...prev.customDefects, newItem] }));
    setNewDefectName('');
    setNewDefectDesc('');
  };

  const removeDefect = (id: string) => {
    setSettings(prev => ({ ...prev, customDefects: prev.customDefects.filter(d => d.id !== id) }));
  };

  const addGrade = () => {
    if (!newGradeName || !newGradeDesc) return;
    const newItem: GradeConfig = { id: Date.now().toString(), name: newGradeName, description: newGradeDesc };
    setSettings(prev => ({ ...prev, customGrades: [...prev.customGrades, newItem] }));
    setNewGradeName('');
    setNewGradeDesc('');
  };

  const removeGrade = (id: string) => {
    setSettings(prev => ({ ...prev, customGrades: prev.customGrades.filter(g => g.id !== id) }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>تنظیمات هوش مصنوعی (WebGPU)</h2>
        <button onClick={handleSave} style={styles.saveBtn}>
          <Icons.Save size={18} /> ذخیره
        </button>
      </div>

      <div style={styles.infoBox}>
        <div style={{ display: 'flex', gap: '8px', fontWeight: 'bold', marginBottom: '8px' }}>
          <Icons.Info size={20} />
          <span>تنظیمات پیشرفته</span>
        </div>
        شما می‌توانید تعاریف عیوب و درجه‌بندی‌ها را تغییر دهید. هوش مصنوعی به‌طور خودکار خود را با تعاریف جدید شما تطبیق می‌دهد.
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}><Icons.HardDrive size={20} /> مدیریت مدل محلی</h3>
        <div style={styles.modelCard}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{settings.modelId}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>مدل فعال WebGPU</div>
          </div>
          <button 
            onClick={handleLoadModel} 
            disabled={isDownloading}
            style={{ 
              backgroundColor: isDownloading ? '#94a3b8' : '#0f172a', color: 'white', 
              border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' 
            }}
          >
            {isDownloading ? 'درحال بارگذاری...' : 'دانلود / لود مدل'}
          </button>
        </div>
        {downloadProgress && (
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#0369a1', fontFamily: 'monospace' }}>
            {downloadProgress}
          </div>
        )}
      </div>

      {/* Grade Definitions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}><Icons.Layers size={20} /> تعریف درجات کیفی (Grades)</h3>
        <div style={styles.listContainer}>
          {settings.customGrades.map(grade => (
            <div key={grade.id} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{grade.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{grade.description}</div>
              </div>
              <button onClick={() => removeGrade(grade.id)} style={styles.deleteBtn}><Icons.Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <div style={styles.inputGroup}>
          <input 
            style={styles.input} 
            placeholder="نام گرید (مثلا Grade 1)" 
            value={newGradeName} 
            onChange={e => setNewGradeName(e.target.value)} 
          />
          <input 
            style={styles.input} 
            placeholder="شرح و معیارها" 
            value={newGradeDesc} 
            onChange={e => setNewGradeDesc(e.target.value)} 
          />
          <button onClick={addGrade} style={styles.addBtn}><Icons.Plus size={20} /></button>
        </div>
      </div>

      {/* Defect Definitions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}><Icons.AlertOctagon size={20} /> تعریف عیوب (Defects)</h3>
        <div style={styles.listContainer}>
          {settings.customDefects.map(defect => (
            <div key={defect.id} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{defect.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{defect.description}</div>
              </div>
              <button onClick={() => removeDefect(defect.id)} style={styles.deleteBtn}><Icons.Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <div style={styles.inputGroup}>
          <input 
            style={styles.input} 
            placeholder="نوع عیب (مثلا شوره سفید)" 
            value={newDefectName} 
            onChange={e => setNewDefectName(e.target.value)} 
          />
          <input 
            style={styles.input} 
            placeholder="توضیحات فنی" 
            value={newDefectDesc} 
            onChange={e => setNewDefectDesc(e.target.value)} 
          />
          <button onClick={addDefect} style={styles.addBtn}><Icons.Plus size={20} /></button>
        </div>
      </div>

    </div>
  );
};

export default Settings;