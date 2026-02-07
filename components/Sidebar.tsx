import React from 'react';
import { Camera, BarChart2, Info, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: <Camera size={20} />, label: 'بازرسی آنلاین' },
    { path: '/dashboard', icon: <BarChart2 size={20} />, label: 'گزارشات و نمودارها' },
    { path: '/hardware', icon: <Info size={20} />, label: 'توصیه سخت‌افزاری' },
    { path: '/settings', icon: <SettingsIcon size={20} />, label: 'تنظیمات هوش مصنوعی' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed right-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <LayoutDashboard className="text-brand-500" />
        <h1 className="text-xl font-bold tracking-wider">QC Galvanize</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-brand-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        نسخه ۱.۱.۰ <br/>
        سیستم هوشمند QC (آفلاین فعال)
      </div>
    </div>
  );
};

export default Sidebar;