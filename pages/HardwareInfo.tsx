import React from 'react';
import { Icons } from '../components/Icons';

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '40px', paddingBottom: '80px' },
  hero: { background: 'linear-gradient(to left, #0c4a6e, #0369a1)', padding: '32px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginBottom: '32px' },
  heroTitle: { fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' },
  card: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  iconBox: (bg: string, color: string) => ({ width: '48px', height: '48px', backgroundColor: bg, color: color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }),
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' },
  text: { fontSize: '14px', lineHeight: '1.7', color: '#475569', textAlign: 'justify' as 'justify' },
  listContainer: { backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  listItem: { display: 'flex', gap: '16px', marginBottom: '24px' },
  brandBadge: { backgroundColor: 'white', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', height: 'fit-content', color: '#334155' }
};

const HardwareInfo: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>راهنمای سخت‌افزار (WebGPU Edition)</h2>
        <p style={{ opacity: 0.9, lineHeight: '1.6' }}>
          برای اجرای روان مدل‌های هوش مصنوعی به صورت محلی در مرورگر، داشتن کارت گرافیک مناسب (GPU) الزامی است. 
          این نسخه از WebGPU برای شتاب‌دهی سخت‌افزاری استفاده می‌کند.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.iconBox('#dbeafe', '#2563eb')}>
            <Icons.Zap size={24} />
          </div>
          <h3 style={styles.cardTitle}>کارت گرافیک (GPU)</h3>
          <p style={styles.text}>
            برای اجرای مدل LLaVA یا Llama-3 در مرورگر، پیشنهاد می‌شود از کارت‌های گرافیک NVIDIA RTX 3060 یا بالاتر با حداقل 8 گیگابایت VRAM استفاده کنید. مرورگرهای Chrome یا Edge (نسخه 113+) از WebGPU پشتیبانی می‌کنند.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.iconBox('#fef9c3', '#ca8a04')}>
            <Icons.Camera size={24} />
          </div>
          <h3 style={styles.cardTitle}>دوربین Line Scan</h3>
          <p style={styles.text}>
            همچنان برای تصویربرداری صنعتی از ورق گالوانیزه در حال حرکت، دوربین‌های Line Scan با اینترفیس GigE Vision پیشنهاد می‌شوند که تصویر را به سیستم پردازش ارسال کنند.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
         <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', borderRight: '4px solid #0ea5e9', paddingRight: '12px' }}>تجهیزات پیشنهادی</h3>
      </div>
      
      <div style={styles.listContainer}>
        <div style={styles.listItem}>
          <span style={styles.brandBadge}>NVIDIA</span>
          <div>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a' }}>RTX 4060 Ti / RTX 3060 12GB</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              بهترین گزینه اقتصادی برای اجرای مدل‌های 7B و 8B به صورت محلی روی WebGPU.
            </p>
          </div>
        </div>
        <div style={styles.listItem}>
          <span style={styles.brandBadge}>Apple</span>
          <div>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a' }}>M2 / M3 Silicon Chips</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              چیپ‌های سیلیکون اپل به دلیل حافظه یکپارچه (Unified Memory) عملکرد فوق‌العاده‌ای در WebLLM دارند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareInfo;