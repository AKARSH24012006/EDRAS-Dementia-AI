import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanAnalysis from './pages/ScanAnalysis';
import Patients from './pages/Patients';
import PatientPortal from './pages/PatientPortal';
import AIChatbot from './pages/AIChatbot';
import TelehealthRoom from './pages/TelehealthRoom';
import SubscriptionPlans from './pages/SubscriptionPlans';
import ProfileModal from './components/ProfileModal';
import AccessDenied from './components/AccessDenied';
import BrainGym from './pages/BrainGym';
import RiskPlan from './pages/RiskPlan';
import { detectBackend } from './lib/backend';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [roleMode, setRoleMode] = useState('doctor'); // 'doctor' or 'patient'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Theme state: defaults to 'light' (soft light blue medtech theme)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('edras_theme') || 'light';
  });

  useEffect(() => { detectBackend(); }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('edras_token');
    const savedUser = localStorage.getItem('edras_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'patient') {
          setRoleMode('patient');
          setActiveTab('patient-space');
        } else {
          setRoleMode('doctor');
          setActiveTab('dashboard');
        }
      } catch (e) {
        setUser({ full_name: 'Clinical User', role: 'doctor', username: 'user' });
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('edras_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (userData.role === 'patient') {
      setRoleMode('patient');
      setActiveTab('patient-space');
    } else {
      setRoleMode('doctor');
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('edras_token');
    localStorage.removeItem('edras_user');
    setUser(null);
    setToken(null);
  };

  const handleUpdateUser = (updatedUserData) => {
    const mergedUser = { ...user, ...updatedUserData };
    setUser(mergedUser);
    localStorage.setItem('edras_user', JSON.stringify(mergedUser));
  };

  // Unauthenticated view
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  const isPatient = user?.role === 'patient';
  const isDoctorOnlyTab = ['dashboard', 'scan-analysis', 'patients'].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#f0f7ff] dark:bg-[#080d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative">
      
      {/* Top Header Navbar with Role-Based Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        roleMode={roleMode}
        setRoleMode={setRoleMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        
        {/* STRICT ROLE-BASED ACCESS CONTROL GUARD:
            If a Patient user tries to access Doctor portals, render AccessDenied wall */}
        {isPatient && isDoctorOnlyTab ? (
          <AccessDenied 
            onReturnToPatientSpace={() => setActiveTab('patient-space')} 
            onSwitchToDoctorLogin={handleLogout} 
          />
        ) : (
          <>
            {/* Doctor Clinical Suite Views */}
            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} theme={theme} />}
            {activeTab === 'scan-analysis' && <ScanAnalysis theme={theme} />}
            {activeTab === 'patients' && <Patients theme={theme} />}

            {/* Patient Portal & Telehealth Suite Views */}
            {activeTab === 'patient-space' && <PatientPortal setActiveTab={setActiveTab} theme={theme} user={user} />}
            {activeTab === 'ai-chatbot' && <AIChatbot theme={theme} />}
            {activeTab === 'telehealth' && <TelehealthRoom theme={theme} user={user} setActiveTab={setActiveTab} />}
            {activeTab === 'subscriptions' && <SubscriptionPlans theme={theme} />}

            {/* Shared wellness tools (doctor + patient) */}
            {activeTab === 'brain-gym' && <BrainGym theme={theme} />}
            {activeTab === 'risk-plan' && <RiskPlan theme={theme} />}
          </>
        )}

      </main>

      {/* User Profile Editor Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        theme={theme}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-sky-200/80 dark:border-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        <p>EDRAS MedTech Platform • Early Dementia Risk Analysis & Multimodal Telehealth AI System © 2026 • HIPAA Compliant AES-256 Encryption</p>
      </footer>

    </div>
  );
}
