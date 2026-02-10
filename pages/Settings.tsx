import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
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
  progressBar: { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '12px' },
  progressFill: (p: number) => ({ width: `${p}%`, height: '100%', backgroundColor: '#0284c7', transition: 'width 0.3s' })
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

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
          <span>حالت کاملاً آفلاین</span>
        </div>
        در این نسخه، مدل هوش مصنوعی (LLM) مستقیماً روی کارت گرافیک سیستم شما (WebGPU) اجرا می‌شود.
        برای بار اول نیاز به دانلود فایل‌های مدل (Cached) است، اما پس از آن بدون نیاز به اینترنت کار می‌کند.
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}><Icons.HardDrive size={20} /> مدیریت مدل محلی</h3>
        
        <div style={styles.modelCard}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Llama-3-8B-Instruct (MLC version)</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>مدل بهینه شده برای اجرای سریع در مرورگر</div>
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
    </div>
  );
};

export default Settings;