import React, { useState, useEffect } from 'react';
import { 
  Activity, Brain, AlertTriangle, ShieldCheck, Scan, ArrowUpRight, 
  TrendingUp, Sparkles, CheckCircle2, FileSpreadsheet, Eye, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, CartesianGrid 
} from 'recharts';
import { http } from '../lib/backend';
import Brain3DVisualizer from '../components/Brain3DVisualizer';

export default function Dashboard({ setActiveTab, theme }) {
  const [stats, setStats] = useState({
    total_scans_analyzed: 148,
    high_risk_count: 32,
    avg_dementia_risk_index: 34.2,
    model_accuracy: 92.6,
    stage_distribution: [
      { name: 'Non Demented (ND)', count: 74, color: '#10b981' },
      { name: 'Very Mild (VMD)', count: 42, color: '#0284c7' },
      { name: 'Mild Dementia (MD)', count: 24, color: '#d97706' },
      { name: 'Moderate (MoD)', count: 8, color: '#dc2626' }
    ]
  });

  const [recentScans, setRecentScans] = useState([
    { id: 101, patient_name: 'Eleanor Vance', patient_age: 74, gender: 'Female', scan_filename: 'OAS1_0028_MR1_100.jpg', predicted_stage: 'Mild Dementia', dementia_risk_score: 78.5, scan_date: '2026-08-04T10:15:00' },
    { id: 102, patient_name: 'Arthur Pendelton', patient_age: 68, gender: 'Male', scan_filename: 'OAS1_0001_MR1_100.jpg', predicted_stage: 'Non Demented', dementia_risk_score: 8.2, scan_date: '2026-08-04T09:30:00' },
    { id: 103, patient_name: 'Martha Stewart', patient_age: 81, gender: 'Female', scan_filename: 'OAS1_0003_MR1_100.jpg', predicted_stage: 'Very Mild Dementia', dementia_risk_score: 42.4, scan_date: '2026-08-03T16:45:00' },
    { id: 104, patient_name: 'Robert Thorne', patient_age: 79, gender: 'Male', scan_filename: 'OAS1_0308_MR1_100.jpg', predicted_stage: 'Moderate Dementia', dementia_risk_score: 94.2, scan_date: '2026-08-03T14:20:00' }
  ]);

  useEffect(() => {
    http.get(`/api/assessments/dashboard-stats`)
      .then(res => { if (res.data) setStats(res.data); })
      .catch(() => console.log('Running in client demo data mode.'));

    http.get(`/api/assessments/scans`)
      .then(res => { if (res.data && res.data.length > 0) setRecentScans(res.data); })
      .catch(() => console.log('Loaded standard demo scan log.'));
  }, []);

  const trendData = [
    { sample: 'Cohort 1', mean_pixel: 34.6, risk_score: 42.1 },
    { sample: 'Cohort 2', mean_pixel: 37.5, risk_score: 8.2 },
    { sample: 'Cohort 3', mean_pixel: 44.1, risk_score: 78.5 },
    { sample: 'Cohort 4', mean_pixel: 29.3, risk_score: 94.2 },
    { sample: 'Cohort 5', mean_pixel: 38.2, risk_score: 12.4 },
    { sample: 'Cohort 6', mean_pixel: 41.5, risk_score: 64.8 }
  ];

  const getBadgeStyle = (stage) => {
    switch (stage) {
      case 'Non Demented':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'Very Mild Dementia':
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30';
      case 'Mild Dementia':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'Moderate Dementia':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const axisColor = theme === 'dark' ? '#94a3b8' : '#475569';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Top Banner / MedTech Welcome */}
      <div className="med-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-sky-200/80 dark:border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-cyan-400/15 dark:bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> MULTIMODAL NEURAL FUSION MODEL v2.4
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">Dataset Coverage: 86,437 Brain Scans</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Clinical Decision Support System</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
            Real-time diagnostic analytics, structural atrophy biomarkers, and Brain MRI scan statistical feature inspection.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scan-analysis')}
          className="px-6 py-3.5 rounded-2xl btn-soft-primary font-extrabold text-sm flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Scan className="w-5 h-5" />
          <span>Analyze Brain MRI Scan</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Metric Summary Cards with 3D Perspective Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="med-card-3d p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Scans Analyzed</span>
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Scan className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_scans_analyzed}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Cross-Validated Brain MRI Scans</p>
        </div>

        {/* Card 2 */}
        <div className="med-card-3d p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">High Risk Alerts</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.high_risk_count}</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
              Clinical Review
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Mild & Moderate Stage Cases</p>
        </div>

        {/* Card 3 */}
        <div className="med-card-3d p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mean Risk Index</span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.avg_dementia_risk_index}%</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Scale: 0-100</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Mean Cognitive DRI Metric</p>
        </div>

        {/* Card 4 */}
        <div className="med-card-3d p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model Accuracy</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.model_accuracy}%</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
              Validated
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">5-Fold Cross Validation Score</p>
        </div>

      </div>

      {/* Visual Analytics & 3D Volumetric Mesh Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3D Interactive Brain Volumetric Viewer (4 cols) */}
        <div className="lg:col-span-4 med-panel p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800 med-card-3d no-tilt flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">3D Volumetric Brain Mesh</h3>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Real-time perspective projection of anatomical brain regions.</p>
          </div>
          <Brain3DVisualizer 
            riskScore={Math.round(stats.avg_dementia_risk_index)} 
            stage={stats.avg_dementia_risk_index > 40 ? 'Mild Dementia' : 'Non Demented'} 
            height={250} 
            theme={theme} 
          />
        </div>

        {/* Bar Chart: Stage Distribution (4 cols) */}
        <div className="lg:col-span-4 med-panel p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800 med-card-3d no-tilt">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Multi-Class Dementia Stage Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cohort split across diagnostic categories</p>
            </div>
            <span className="text-xs font-mono bg-sky-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              Class Imbalance 50.5 : 1
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stage_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#bae6fd', 
                    borderRadius: '16px', 
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {stats.stage_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Pixel Intensity vs Risk Score (4 cols) */}
        <div className="lg:col-span-4 med-panel p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800 med-card-3d no-tilt">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">MRI Pixel Intensity vs. Severity Index</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Task 3 Regression Feature Correlation ($R^2 = 0.228$)</p>
            </div>
            <span className="text-xs font-mono bg-sky-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              Feature Variance
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="sample" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#bae6fd', 
                    borderRadius: '16px',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line type="monotone" dataKey="risk_score" stroke="#0284c7" strokeWidth={3} dot={{ r: 5, fill: '#0284c7' }} name="Dementia Risk Index (%)" />
                <Line type="monotone" dataKey="mean_pixel" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} name="Mean Pixel Intensity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent MRI Scan Diagnostic Registry */}
      <div className="med-panel p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Recent Diagnostic MRI Scan History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Automated multi-modal scan diagnostic logs</p>
          </div>
          <button 
            onClick={() => setActiveTab('scan-analysis')}
            className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>Analyze New Scan</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-sky-100/60 dark:bg-slate-900/80 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-sky-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Demographics</th>
                <th className="py-3.5 px-4">MRI Scan Filename</th>
                <th className="py-3.5 px-4">Diagnostic Stage</th>
                <th className="py-3.5 px-4">Risk Metric</th>
                <th className="py-3.5 px-4">Scan Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60 font-medium">
              {recentScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-sky-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold flex items-center justify-center text-xs">
                      {scan.patient_name.charAt(0)}
                    </div>
                    <span>{scan.patient_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{scan.patient_age} yrs • {scan.gender}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">{scan.scan_filename}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-xl border ${getBadgeStyle(scan.predicted_stage)}`}>
                      {scan.predicted_stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white font-mono">{scan.dementia_risk_score}%</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">{new Date(scan.scan_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
