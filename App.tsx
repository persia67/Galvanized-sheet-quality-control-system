import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LiveInspection from './pages/LiveInspection';
import Dashboard from './pages/Dashboard';
import HardwareInfo from './pages/HardwareInfo';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', direction: 'rtl', backgroundColor: '#f8fafc' }}>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, marginRight: '250px', transition: 'all 0.3s' }}>
          <Routes>
            <Route path="/" element={<LiveInspection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hardware" element={<HardwareInfo />} />
            <Route path="/settings" element={<Settings />} />
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