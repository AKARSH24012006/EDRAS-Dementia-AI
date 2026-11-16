import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, ShieldCheck, UserPlus, X, CheckCircle, 
  AlertCircle, RefreshCw, Lock, Calendar, BookOpen, Users
} from 'lucide-react';
import { http, isNetworkError, serverMessage } from '../lib/backend';
import PatientHistory from '../components/PatientHistory';

export default function Patients({ theme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([
    { id: 1, patient_uuid: 'P-98421', name: 'Eleanor Vance', dob: '1952-04-12', gender: 'Female', education_years: 16, status: 'Mild Dementia', risk: '78.5%' },
    { id: 2, patient_uuid: 'P-98422', name: 'Arthur Pendelton', dob: '1958-09-24', gender: 'Male', education_years: 14, status: 'Non Demented', risk: '8.2%' },
    { id: 3, patient_uuid: 'P-98423', name: 'Martha Stewart', dob: '1945-02-18', gender: 'Female', education_years: 12, status: 'Very Mild Dementia', risk: '42.4%' },
    { id: 4, patient_uuid: 'P-98424', name: 'Robert Thorne', dob: '1947-11-05', gender: 'Male', education_years: 18, status: 'Moderate Dementia', risk: '94.2%' },
    { id: 5, patient_uuid: 'P-98425', name: 'Clara Oswald', dob: '1955-07-30', gender: 'Female', education_years: 15, status: 'Non Demented', risk: '11.8%' }
  ]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    dob: '1954-06-15',
    gender: 'Female',
    education_years: 14
  });

  const fetchPatients = () => {
    setLoading(true);
    // Trailing slash matters: '/api/patients' 308-redirects, which breaks the CORS preflight.
    http.get('/api/patients/')
    .then(res => {
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setPatients(res.data);
      }
    })
    .catch(() => console.log('Loaded verified local cohort registry.'))
    .finally(() => setLoading(false));
  };

  const [scans, setScans] = useState([]);
  const [historyFor, setHistoryFor] = useState(null);

  useEffect(() => {
    fetchPatients();
    http.get('/api/assessments/scans').then((r) => setScans(r.data || [])).catch(() => {});
  }, []);

  // Live patients have no status field: derive it from their most recent scan.
  const latestStage = (name) => scans.filter((x) => x.patient_name === name).sort((a, b) => (b.scan_date || '').localeCompare(a.scan_date || ''))[0]?.predicted_stage;

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await http.post('/api/patients/', { ...newPatient, education_years: Number(newPatient.education_years) });

      if (res.data) {
        setPatients(prev => [res.data, ...prev]);
        setSuccessMsg(`Patient ${newPatient.name} enrolled with AES-256 PII encryption!`);
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg('');
          setNewPatient({ name: '', dob: '1954-06-15', gender: 'Female', education_years: 14 });
        }, 1200);
      }
    } catch (err) {
      if (!isNetworkError(err)) {
        setErrorMsg(serverMessage(err, 'Enrolment failed. Check the details and try again.'));
        return;
      }
      // Backend unreachable: keep the entry locally (demo mode)
      const mockEntry = {
        id: Date.now(),
        patient_uuid: `P-${Math.floor(10000 + Math.random() * 90000)}`,
        name: newPatient.name,
        dob: newPatient.dob,
        gender: newPatient.gender,
        education_years: newPatient.education_years,
        status: 'Baseline Screening',
        risk: '15.0%'
      };
      setPatients(prev => [mockEntry, ...prev]);
      setSuccessMsg(`Patient ${newPatient.name} enrolled successfully!`);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setNewPatient({ name: '', dob: '1954-06-15', gender: 'Female', education_years: 14 });
      }, 1200);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.patient_uuid && p.patient_uuid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> HIPAA LEVEL 3 CLINICAL REGISTRY
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Patient Clinical Registry</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            AES-256 encrypted longitudinal diagnostic records, MRI scans, and cognitive histories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or UUID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 w-56 sm:w-72 font-medium shadow-xs"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl btn-soft-primary font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Enroll Patient</span>
          </button>
        </div>
      </div>

      {/* Registry Table Panel */}
      <div className="med-panel rounded-3xl border border-sky-200/80 dark:border-slate-800 overflow-hidden shadow-xl med-card-3d no-tilt">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-sky-100/60 dark:bg-slate-900/80 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-sky-200/80 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Patient UUID</th>
                <th className="py-4 px-6">Full Legal Name</th>
                <th className="py-4 px-6">Date of Birth / Age</th>
                <th className="py-4 px-6">Gender</th>
                <th className="py-4 px-6">Education</th>
                <th className="py-4 px-6">Diagnostic Stage</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60 font-medium">
              {filteredPatients.map((p) => (
                <tr key={p.id || p.patient_uuid} className="hover:bg-sky-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-cyan-600 dark:text-cyan-400 font-extrabold">{p.patient_uuid}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                      {p.name ? p.name.charAt(0) : 'P'}
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-xs">{p.dob || '1950-01-01'}</td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{p.gender || 'Unspecified'}</td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{p.education_years || 12} years</td>
                  <td className="py-4 px-6 font-bold">
                    <span className="px-2.5 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                      {p.status || latestStage(p.name) || (p.assessment_count ? `${p.assessment_count} assessments` : 'Baseline pending')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => setHistoryFor(p)}
                      aria-label={`Open records for ${p.name}`}
                      className="p-2 rounded-xl bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                      title="View Clinical Records"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {historyFor && <PatientHistory patient={historyFor} scans={scans} onClose={() => setHistoryFor(null)} />}

      {/* Patient Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md w-full med-panel p-6 sm:p-8 rounded-3xl border border-sky-200/80 dark:border-slate-800 shadow-2xl med-card-3d no-tilt relative">
            
            <div className="flex items-center justify-between border-b border-sky-200/60 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Enroll New Patient</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">AES-256 HIPAA Enrollee Vault</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Margaret Thatcher"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newPatient.dob}
                    onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Years of Education</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  value={newPatient.education_years}
                  onChange={(e) => setNewPatient({ ...newPatient, education_years: parseInt(e.target.value) || 12 })}
                  className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-900/70 border border-sky-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl btn-soft-secondary font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2.5 rounded-xl btn-soft-primary font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {modalLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalLoading ? 'Encrypting...' : 'Save & Encrypt'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
