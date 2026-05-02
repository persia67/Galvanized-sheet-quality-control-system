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
        <h2 style={styles.heroTitle}>پیکربندی سخت‌افزار (Multi-Camera Support)</h2>
        <p style={{ opacity: 0.9, lineHeight: '1.6' }}>
          این نسخه از نرم‌افزار برای کار با دوربین‌های صنعتی Dahua و سیستم‌های نظارتی T&D بهینه‌سازی شده است. 
          ترکیب دقت بالا (Dahua) و دید وسیع ۳۶۰ درجه (T&D) پوشش کامل خط تولید را فراهم می‌کند.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.iconBox('#dbeafe', '#2563eb')}>
            <Icons.Zap size={24} />
          </div>
          <h3 style={styles.cardTitle}>واحد پردازش (GPU)</h3>
          <p style={styles.text}>
            برای پردازش همزمان داده‌های دوربین 4 مگاپیکسلی و دوربین PTZ، استفاده از کارت گرافیک‌های سری RTX با حداقل 6GB حافظه الزامی است.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.iconBox('#fef9c3', '#ca8a04')}>
            <Icons.Camera size={24} />
          </div>
          <h3 style={styles.cardTitle}>پروفایل‌های دوربین</h3>
          <p style={styles.text}>
            نرم‌افزار دارای پروفایل‌های اختصاصی برای مدل‌های Dahua HFW2440 (تشخیص عیوب)، HFW1230 (نظارت) و T&D PTZ (دید محیطی) می‌باشد.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
         <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', borderRight: '4px solid #0ea5e9', paddingRight: '12px' }}>تجهیزات نصب شده</h3>
      </div>
      
      <div style={styles.listContainer}>
        <div style={styles.listItem}>
          <span style={styles.brandBadge}>Dahua 4MP</span>
          <div>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a' }}>IPC-HFW2440 Series (WizSense)</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              دوربین اصلی بازرسی با رزولوشن 2688x1520. مجهز به سنسور Starlight برای عملکرد عالی در محیط‌های کارخانه با نور متغیر. مناسب برای تشخیص خراش‌های ریز و حفره‌ها.
            </p>
          </div>
        </div>
        <div style={styles.listItem}>
          <span style={styles.brandBadge}>T&D PTZ</span>
          <div>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a' }}>T&D 360° PTZ Series</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              دوربین گردان با قابلیت چرخش ۳۶۰ درجه و زوم اپتیکال. ایده‌آل برای نظارت کلی بر سالن تولید و بررسی زوایای مختلف کویل در هنگام جابجایی.
            </p>
          </div>
        </div>
        <div style={styles.listItem}>
          <span style={styles.brandBadge}>Dahua 2MP</span>
          <div>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a' }}>IPC-HFW1230 Series (Entry)</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              دوربین نظارتی ثابت با رزولوشن 1920x1080. مناسب برای تشخیص تغییر رنگ کلی ورق و نظارت بر روند حرکت کویل.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareInfo;