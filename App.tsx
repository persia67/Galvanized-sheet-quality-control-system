import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LiveInspection from './pages/LiveInspection';
import Dashboard from './pages/Dashboard';
import HardwareInfo from './pages/HardwareInfo';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen font-sans text-right" dir="rtl">
        
        {/* Main Content Area - Shifted left due to fixed right sidebar */}
        <div className="flex-1 mr-64 transition-all duration-300">
          <Routes>
            <Route path="/" element={<LiveInspection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hardware" element={<HardwareInfo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Sidebar Navigation */}
        <Sidebar />
      </div>
    </Router>
  );
};

export default App;