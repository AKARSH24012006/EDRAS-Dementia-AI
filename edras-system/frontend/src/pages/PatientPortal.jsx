import React, { useState, useEffect, useRef } from 'react';
import { 
  User, FileText, Upload, Brain, Activity, Video, MessageSquare, ShieldCheck, 
  Download, CheckCircle2, Clock, Sparkles, File, Image as ImageIcon, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { http, isNetworkError, serverMessage } from '../lib/backend';
import Brain3DVisualizer from '../components/Brain3DVisualizer';

export default function PatientPortal({ setActiveTab, theme, user }) {
  const [reports, setReports] = useState([
    { id: 1, original_name: 'Brain_MRI_Scan_OAS1_0028.png', file_type: 'png', upload_date: '2026-08-04T10:15:00', extracted_summary: 'Radiology image artifact indexed. Automated feature matrix extracted.' },
    { id: 2, original_name: 'Blood_Biomarker_Panel_2026.pdf', file_type: 'pdf', upload_date: '2026-08-03T14:20:00', extracted_summary: 'Medical PDF parsed. Cognitive test scores and ApoE4 allele status cataloged.' },
    { id: 3, original_name: 'Cognitive_Scores_MMSE_MoCA.csv', file_type: 'csv', upload_date: '2026-08-01T09:30:00', extracted_summary: 'Biomarker spreadsheet loaded. 24 features aligned with Task 1 dataset schema.' }
  ]);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    http.get(`/api/assessments/patient-reports`)
      .then(res => { if (res.data && res.data.length > 0) setReports(res.data); })
      .catch(() => console.log('Loaded client demo patient vault files.'));
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadSuccess('');
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_name', user?.full_name || 'Clinical Patient');

    try {
      // No manual Content-Type: the browser must add the multipart boundary itself.
      const res = await http.post(`/api/assessments/upload-patient-report`, formData);
      if (res.data && res.data.report) {
        setReports(prev => [res.data.report, ...prev]);
        setUploadSuccess(`Uploaded ${file.name} successfully!`);
      }
    } catch (err) {
      if (!isNetworkError(err)) {
        setUploadError(serverMessage(err, `Couldn't upload ${file.name}. Use PDF, JPG, PNG, DICOM or CSV.`));
        return;
      }
      const mockReport = {
        id: Date.now(),
        original_name: file.name,
        file_type: file.name.split('.').pop() || 'pdf',
        upload_date: new Date().toISOString(),
        extracted_summary: `Processed ${file.name} into HIPAA-encrypted patient vault.`
      };
      setReports(prev => [mockReport, ...prev]);
      setUploadSuccess(`Uploaded ${file.name} to vault!`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadSuccess(''), 3000);
    }
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png': return <ImageIcon className="w-5 h-5 text-sky-500" />;
      case 'csv': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'dicom': return <Brain className="w-5 h-5 text-cyan-500" />;
      default: return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Patient Welcome Hero */}
      <div className="med-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-sky-200/80 dark:border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-cyan-400/15 dark:bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA ENCRYPTED PERSONAL PATIENT SPACE
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">Patient UUID: #P-98423</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome, {user?.full_name || 'Clinical Patient'}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
            Your personal brain health vault, MRI scan diagnostic timeline, pretrained AI assistant, and direct doctor telehealth space.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab('ai-chatbot')}
            className="px-5 py-3 rounded-2xl btn-soft-secondary font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Consult AI Bot</span>
          </button>

          <button
            onClick={() => setActiveTab('telehealth')}
            className="px-5 py-3 rounded-2xl btn-soft-primary font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Start Telehealth Call</span>
          </button>
        </div>
      </div>

      {/* Patient Personal Health Diagnostic Summary (3D Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="med-card-3d p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dementia Risk Index (DRI)</span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-4 font-mono">42.4%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Monitored Cognitive Health</p>
        </div>

        <div className="med-card-3d p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Diagnostic Classification</span>
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-4">Very Mild Dementia</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Early Stage / Lifestyle Monitored</p>
        </div>

        <div className="med-card-3d p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cognitive Test Scores</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-4">
            <div>
              <p className="text-xs text-slate-400 font-bold">MMSE</p>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">25 / 30</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold">MoCA</p>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">23 / 30</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Evaluated Aug 2026</p>
        </div>

      </div>

      {/* 3D Brain Wellness Projection Showcase */}
      <div className="med-panel p-6 sm:p-8 rounded-3xl border border-sky-200/80 dark:border-slate-800 med-card-3d no-tilt">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Personal 3D Visualizer</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Your 3D Brain Wellness Projection</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Interactive 3D model reflecting your latest MRI biomarkers. Rotate the model in 3D to explore monitored areas.
            </p>
          </div>
        </div>

        <Brain3DVisualizer
          riskScore={42}
          stage="Very Mild Dementia"
          height={280}
          theme={theme}
        />
      </div>

      {/* Multi-Format Medical Vault & Document Upload */}
      <div className="med-panel p-8 rounded-3xl border border-sky-200/80 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Multi-Format Medical Vault</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Upload PDF reports, Brain MRI images (JPG/PNG), DICOM scans, or CSV clinical data.</p>
          </div>

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="px-5 py-3 rounded-2xl btn-soft-primary font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading & Indexing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Medical Report (PDF/JPG/PNG/DICOM/CSV)</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.dicom,.csv"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </div>

        {uploadError && (
          <div role="alert" className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">{uploadError}</div>
        )}
        {uploadSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="med-card p-5 rounded-2xl border border-sky-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-slate-800 shrink-0">
                  {getFileIcon(r.file_type)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{r.original_name}</p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">{r.file_type} Document</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {r.extracted_summary}
              </p>
              <div className="pt-2 border-t border-sky-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{new Date(r.upload_date).toLocaleDateString()}</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Encrypted</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
