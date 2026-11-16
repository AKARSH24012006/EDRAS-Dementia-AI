import React, { useState } from 'react';
import { 
  Brain, Lock, User, Mail, ShieldCheck, ArrowRight, Eye, EyeOff, 
  CheckCircle, AlertCircle, Sun, Moon, Stethoscope, HeartPulse, Sparkles, Shield
} from 'lucide-react';
import { http, isNetworkError, serverMessage, useBackendMode } from '../lib/backend';
import Brain3DVisualizer from '../components/Brain3DVisualizer';

export default function Login({ onLoginSuccess, theme, toggleTheme }) {
  // Dual Login Mode: 'doctor' or 'patient'
  const [loginType, setLoginType] = useState('doctor');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const backendMode = useBackendMode();

  // Form states for Doctor & Patient
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    patient_id: '',
    role: 'Senior Neurologist'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setError('');
    setSuccessMsg('');
    setIsRegister(false);
    if (type === 'patient') {
      setFormData(prev => ({ ...prev, role: 'patient', username: prev.username || 'patient_eleanor' }));
    } else {
      setFormData(prev => ({ ...prev, role: 'Senior Neurologist', username: prev.username || 'dr_jenkins' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const roleAssigned = loginType === 'patient' ? 'patient' : (formData.role || 'doctor');

      const payload = isRegister 
        ? { ...formData, role: roleAssigned }
        : { 
            username: formData.username || (loginType === 'patient' ? formData.patient_id : formData.username), 
            password: formData.password 
          };

      const response = await http.post(endpoint, payload);

      if (response.data.token) {
        const userObj = {
          ...response.data.user,
          role: loginType === 'patient' ? 'patient' : (response.data.user.role || 'doctor')
        };

        localStorage.setItem('edras_token', response.data.token);
        localStorage.setItem('edras_user', JSON.stringify(userObj));
        setSuccessMsg(
          loginType === 'patient' 
            ? 'Patient verified! Opening your personalized care space...' 
            : 'Clinical credentials verified! Loading medical dashboard...'
        );
        
        setTimeout(() => {
          onLoginSuccess(userObj, response.data.token);
        }, 600);
      }
    } catch (err) {
      // Wrong password / taken username etc.: show the server's message, never log in.
      if (!isNetworkError(err)) {
        setError(serverMessage(err, 'Sign-in failed. Check your username and password.'));
        return;
      }
      // Backend unreachable (e.g. static Netlify demo): offline demo session.
      const mockUser = loginType === 'patient' ? {
        username: formData.username || formData.patient_id || 'patient_eleanor',
        full_name: formData.full_name || 'Eleanor Vance',
        role: 'patient',
        email: formData.email || 'eleanor.vance@patient-care.org',
        patient_uuid: 'EDRAS-PT-2026-4921'
      } : {
        username: formData.username || 'dr_jenkins',
        full_name: formData.full_name || 'Dr. Sarah Jenkins',
        role: 'doctor',
        email: formData.email || 's.jenkins@edras-clinical.org',
        department: 'Department of Neurology & Cognitive Sciences'
      };

      const mockToken = `demo_jwt_${loginType}_token_2026`;
      localStorage.setItem('edras_token', mockToken);
      localStorage.setItem('edras_user', JSON.stringify(mockUser));
      
      setSuccessMsg(`Welcome, ${mockUser.full_name}! Authenticated.`);
      setTimeout(() => {
        onLoginSuccess(mockUser, mockToken);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access One-Click buttons
  const handleQuickDemo = (type) => {
    if (type === 'patient') {
      const patientUser = {
        username: 'eleanor_vance',
        full_name: 'Eleanor Vance',
        role: 'patient',
        email: 'eleanor.vance@care-portal.org',
        patient_uuid: 'EDRAS-PT-2026-4921'
      };
      const token = 'demo_patient_token_2026';
      localStorage.setItem('edras_token', token);
      localStorage.setItem('edras_user', JSON.stringify(patientUser));
      onLoginSuccess(patientUser, token);
    } else {
      const doctorUser = {
        username: 'dr_jenkins',
        full_name: 'Dr. Sarah Jenkins',
        role: 'doctor',
        email: 's.jenkins@edras-clinical.org',
        department: 'Department of Neurology & Cognitive Sciences'
      };
      const token = 'demo_doctor_token_2026';
      localStorage.setItem('edras_token', token);
      localStorage.setItem('edras_user', JSON.stringify(doctorUser));
      onLoginSuccess(doctorUser, token);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 md:p-8 md:pt-8 relative overflow-hidden bg-[#f0f7ff] dark:bg-[#080d16] transition-colors duration-300">
      
      {/* 3D Ambient Medical Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full filter blur-[120px] pointer-events-none animate-float-3d"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-400/20 dark:bg-blue-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Floating 3D Background Geometric Nodes */}
      <div className="absolute top-16 left-12 w-28 h-28 rounded-3xl border border-cyan-500/20 mri-grid-3d opacity-40 pointer-events-none hidden lg:block"></div>
      <div className="absolute bottom-16 right-12 w-36 h-36 rounded-full border border-sky-400/20 animate-orbit-3d pointer-events-none hidden lg:block"></div>

      {/* Top Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="p-3 rounded-2xl med-card text-slate-700 dark:text-amber-300 hover:scale-105 transition-all cursor-pointer shadow-md"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      {/* Main Dual-Column 3D Showcase Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: 3D Holographic Interactive Brain Visualizer Showcase */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-teal-400 text-white shadow-lg shadow-cyan-500/30">
              <Brain className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">EDRAS</h1>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">3D MedAI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Early Dementia Risk Analysis & Multimodal Telehealth</p>
            </div>
          </div>

          {/* Interactive 3D Holographic Canvas */}
          <div className="med-card-3d no-tilt rounded-3xl p-3 shadow-2xl relative">
            <Brain3DVisualizer 
              riskScore={loginType === 'patient' ? 22 : 68} 
              stage={loginType === 'patient' ? 'Non Demented' : 'Mild Dementia'} 
              height={380}
              theme={theme}
            />

          </div>


        </div>

        {/* Right Column: Dual-Login Type Form (Doctor vs Patient) */}
        <div className="lg:col-span-6 med-panel p-6 sm:p-8 rounded-3xl border border-sky-200/80 dark:border-slate-800 shadow-2xl med-card-3d no-tilt relative">
          
          {/* Dual Login Type Toggle Switch */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-sky-100/70 dark:bg-slate-900/90 rounded-2xl border border-sky-200/60 dark:border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => handleLoginTypeChange('doctor')}
              className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                loginType === 'doctor'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor / Clinician</span>
            </button>

            <button
              type="button"
              onClick={() => handleLoginTypeChange('patient')}
              className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                loginType === 'patient'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Patient Space</span>
            </button>
          </div>

          {/* Header Description for Selected Portal */}
          <div className="mb-6 text-left">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2 border ${
              loginType === 'doctor' 
                ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30' 
                : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30'
            }">
              <Shield className="w-3 h-3" />
              <span>{loginType === 'doctor' ? 'Clinical Clearance Access' : 'Encrypted Patient Care Space'}</span>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {loginType === 'doctor' 
                ? (isRegister ? 'Clinician Enrollment' : 'Doctor Portal Sign In') 
                : (isRegister ? 'Patient Registration' : 'Patient Portal Sign In')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {loginType === 'doctor' 
                ? 'Access MRI scanner analytics, clinical diagnostic models, and patient registries.' 
                : 'View your brain health journey, scan reports, telehealth appointments, and cognitive AI assistant.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login / Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder={loginType === 'doctor' ? "Dr. Jonathan Hayes" : "Eleanor Vance"}
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {loginType === 'doctor' ? 'Staff Username / Clinician ID' : 'Patient Health ID or Username'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder={loginType === 'doctor' ? "dr_jenkins" : "EDRAS-PT-2026 or username"}
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="user@health-network.org"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {isRegister && loginType === 'doctor' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Specialization</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="Senior Neurologist">Senior Neurologist</option>
                  <option value="Neuro-Radiologist">Neuro-Radiologist</option>
                  <option value="Clinical Neuropsychologist">Clinical Neuropsychologist</option>
                  <option value="Memory Clinic Director">Memory Clinic Director</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl btn-soft-primary font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : (isRegister ? 'Complete Registration' : `Sign In to ${loginType === 'doctor' ? 'Doctor Portal' : 'Patient Space'}`)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Quick Demo Access Trigger */}
          <div className="mt-5 pt-4 border-t border-sky-200/60 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => handleQuickDemo(loginType)}
              className="w-full py-2.5 px-3 rounded-xl btn-soft-secondary font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>
                {loginType === 'doctor' 
                  ? 'Instant Clinician Access (Dr. Sarah Jenkins)' 
                  : 'Instant Patient Access (Eleanor Vance)'}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              {backendMode === 'live'
                ? 'Connected to the EDRAS AI backend.'
                : backendMode === 'waking' || backendMode === 'checking'
                  ? 'Waking the AI server (about a minute on the free plan). You can sign in now.'
                  : 'Demo mode: no backend connected. Data stays in this browser.'}
            </p>
          </div>

          {/* Switch Register/Login */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              {isRegister 
                ? 'Already registered? Sign in here' 
                : `New ${loginType === 'doctor' ? 'clinician' : 'patient'}? Create an account`}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
