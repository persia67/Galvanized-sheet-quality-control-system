import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from './Icons';

const styles = {
  container: {
    width: '250px',
    backgroundColor: '#0f172a',
    color: 'white',
    height: '100vh',
    position: 'fixed' as 'fixed',
    right: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column' as 'column',
    boxShadow: '-4px 0 15px rgba(0,0,0,0.3)',
    zIndex: 50,
    borderLeft: '1px solid #1e293b'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  nav: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px'
  },
  link: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.2s',
    backgroundColor: active ? '#0284c7' : 'transparent',
    color: active ? 'white' : '#94a3b8',
    fontWeight: active ? '500' : 'normal',
    boxShadow: active ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
  }),
  footer: {
    padding: '16px',
    borderTop: '1px solid #1e293b',
    fontSize: '12px',
    color: '#64748b',
    textAlign: 'center' as 'center'
  }
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: <Icons.Camera size={20} />, label: 'بازرسی آنلاین' },
    { path: '/dashboard', icon: <Icons.BarChart2 size={20} />, label: 'گزارشات و نمودارها' },
    { path: '/hardware', icon: <Icons.Info size={20} />, label: 'توصیه سخت‌افزاری' },
    { path: '/settings', icon: <Icons.Settings size={20} />, label: 'تنظیمات هوش مصنوعی' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Icons.LayoutDashboard size={24} color="#0ea5e9" />
        <h1 style={styles.title}>QC Galvanize</h1>
      </div>
      
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={styles.link(isActive(item.path))}
          >
            {item.icon}
            <span style={{ fontSize: '14px' }}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={styles.footer}>
        نسخه ۲.۰.۰ (Offline)<br/>
        قدرت گرفته از WebGPU
      </div>
    </div>
  );
};

export default Sidebar;