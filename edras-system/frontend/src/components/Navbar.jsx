import React from 'react';
import { 
  Brain, LayoutDashboard, Scan, Users, LogOut, ShieldCheck, Sun, Moon, Sparkles, 
  UserCheck, Video, MessageSquare, CreditCard, HeartPulse, ShieldAlert, Lock, Puzzle, Leaf
} from 'lucide-react';
import { useBackendMode } from '../lib/backend';

function BackendPill() {
  const mode = useBackendMode();
  const map = {
    live: ['bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', 'AI Live', 'Connected to the EDRAS Flask backend: results come from the trained model.'],
    demo: ['bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30', 'Demo', 'No backend connected. Sample data, stored in this browser; MRI results are illustrative estimates.'],
    waking: ['bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30', 'Waking AI…', 'The free backend sleeps when idle and takes about a minute to start.'],
    checking: ['bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30', 'Connecting…', 'Checking for the EDRAS backend.'],
  }[mode];
  return (
    <span title={map[2]} className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-extrabold whitespace-nowrap ${map[0]}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${mode === 'live' ? '' : 'animate-pulse'}`} />{map[1]}
    </span>
  );
}

function SharedTabs({ activeTab, setActiveTab }) {
  const cls = (id) => `flex shrink-0 items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
    activeTab === id
      ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
  }`;
  return (
    <>
      <button onClick={() => setActiveTab('brain-gym')} className={cls('brain-gym')}>
        <Puzzle className="w-4 h-4" /><span>Brain Gym</span>
      </button>
      <button onClick={() => setActiveTab('risk-plan')} className={cls('risk-plan')}>
        <Leaf className="w-4 h-4" /><span>Risk Plan</span>
      </button>
    </>
  );
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  theme, 
  toggleTheme, 
  onOpenProfile, 
  roleMode, 
  setRoleMode 
}) {
  const isPatient = user?.role === 'patient';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f0f7ff]/90 dark:bg-[#080d16]/90 border-b border-sky-200/60 dark:border-slate-800/80 px-4 sm:px-6 py-3 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-3 gap-x-3">
        
        {/* Brand Logo & 3D MedTech Engine Badge */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setActiveTab(isPatient ? 'patient-space' : 'dashboard')}
        >
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-teal-400 text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-black tracking-tight text-slate-900 dark:text-white">EDRAS</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 whitespace-nowrap">3D MedAI</span>
              <span className="text-[10px] text-slate-400 font-mono hidden 2xl:inline-block border border-sky-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">v2.5</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden 2xl:block">
              {isPatient 
                ? 'Encrypted Patient Care Space' 
                : 'Early Dementia Risk Analysis & Clinical AI'}
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs based on User Role */}
        <nav className="order-3 lg:order-none w-full lg:w-auto overflow-x-auto flex items-center space-x-1 sm:space-x-1.5 bg-sky-100/70 dark:bg-slate-900/80 p-1 sm:p-1.5 rounded-2xl border border-sky-200/60 dark:border-slate-800">
          
          {/* DOCTOR VIEW TABS (Only for authenticated Clinicians) */}
          {!isPatient && roleMode === 'doctor' && (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex shrink-0 whitespace-nowrap items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden 2xl:inline">Clinical Dashboard</span>
                <span className="2xl:hidden">Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('scan-analysis')}
                className={`flex shrink-0 whitespace-nowrap items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'scan-analysis'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Scan className="w-4 h-4" />
                <span className="hidden 2xl:inline">MRI 3D Scan Analysis</span>
                <span className="2xl:hidden">MRI Scans</span>
              </button>

              <button
                onClick={() => setActiveTab('patients')}
                className={`flex shrink-0 whitespace-nowrap items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'patients'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden 2xl:inline">Patient Registry</span>
                <span className="2xl:hidden">Patients</span>
              </button>
            </>
          )}

          {/* PATIENT VIEW TABS (For Patients OR for Doctors previewing Patient Space) */}
          {(isPatient || roleMode === 'patient') && (
            <>
              <button
                onClick={() => setActiveTab('patient-space')}
                className={`flex shrink-0 whitespace-nowrap items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'patient-space'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span className="hidden 2xl:inline">My Care Space</span>
                <span className="2xl:hidden">My Care</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-chatbot')}
                className={`flex shrink-0 whitespace-nowrap items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ai-chatbot'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden 2xl:inline">AI Health Bot</span>
                <span className="2xl:hidden">AI Bot</span>
              </button>

              <button
                onClick={() => setActiveTab('telehealth')}
                className={`flex shrink-0 whitespace-nowrap items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'telehealth'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Telehealth</span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`flex shrink-0 whitespace-nowrap items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'subscriptions'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden 2xl:inline">Care Plans</span>
                <span className="2xl:hidden">Plans</span>
              </button>
            </>
          )}

          <SharedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>

        {/* Right Action Icons & Profile Badge */}
 <div className="flex items-center space-x-2 sm:space-x-3">
          <BackendPill />
          
          {/* Role Status or Switcher */}
          {isPatient ? (
            <div title="Patient Account" className="px-3 py-1.5 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-[11px] font-extrabold flex items-center space-x-1.5 select-none">
              <HeartPulse className="w-3.5 h-3.5 text-teal-500" />
              <span className="whitespace-nowrap hidden 2xl:inline">Patient Account</span>
            </div>
          ) : (
            <button
              onClick={() => {
                const newMode = roleMode === 'doctor' ? 'patient' : 'doctor';
                setRoleMode(newMode);
                setActiveTab(newMode === 'patient' ? 'patient-space' : 'dashboard');
              }}
              className="px-3 py-1.5 rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-extrabold flex items-center space-x-1.5 cursor-pointer hover:bg-cyan-500/20 transition-all"
              title="Doctor Clearance: Switch between Clinical Station and Patient Telehealth view"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap hidden 2xl:inline">{roleMode === 'doctor' ? 'Doctor View' : 'Patient View'}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/80 dark:border-slate-800 text-slate-700 dark:text-amber-300 hover:scale-105 transition-all cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile Info Badge */}
          <div 
            onClick={onOpenProfile}
            title="Click to Edit Profile & Photo"
            className="flex items-center space-x-2.5 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-xs cursor-pointer hover:border-cyan-500 transition-all group"
          >
            {user?.profile_pic ? (
              <img src={user.profile_pic} alt="Profile Avatar" className="w-7 h-7 rounded-xl object-cover border border-cyan-500 shadow-xs group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center font-bold text-white text-xs shadow-xs group-hover:scale-105 transition-transform">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
            )}

            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-[120px]">
                {user?.full_name || 'Verified User'}
              </p>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold uppercase truncate max-w-[120px]">
                {isPatient ? 'Patient Portal' : (user?.role || 'Clinician')}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
