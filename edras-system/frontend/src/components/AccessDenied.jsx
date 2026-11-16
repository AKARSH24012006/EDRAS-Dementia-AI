import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, HeartPulse } from 'lucide-react';

export default function AccessDenied({ onReturnToPatientSpace, onSwitchToDoctorLogin }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full med-panel p-8 rounded-3xl border border-rose-300/70 dark:border-rose-900/50 shadow-2xl text-center relative overflow-hidden med-card-3d no-tilt">
        
        {/* Ambient warning background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* 3D Security Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 mb-6 animate-pulse-glow-3d">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-mono font-bold uppercase mb-3">
          <Lock className="w-3 h-3" />
          <span>Restricted Clinical Space</span>
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          Doctor Portal Clearance Required
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          This portal contains restricted diagnostic imaging tools, raw MRI scanner controls, and HIPAA-regulated clinical registries. As a registered patient, your medical data and doctor appointments are protected inside your personalized Patient Space.
        </p>

        <div className="space-y-3">
          <button
            onClick={onReturnToPatientSpace}
            className="w-full py-3 px-4 rounded-xl btn-soft-primary font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Return to My Patient Space</span>
          </button>

          <button
            onClick={onSwitchToDoctorLogin}
            className="w-full py-2.5 px-4 rounded-xl btn-soft-secondary font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In as Doctor / Clinician</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-mono mt-6">
          HIPAA Audit ID: SEC-403-PATIENT-RESTRICTED • Encryption: AES-256
        </p>

      </div>
    </div>
  );
}
