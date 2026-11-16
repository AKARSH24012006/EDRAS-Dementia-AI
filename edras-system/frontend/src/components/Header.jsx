import React from 'react';
import { BrainCircuit, ShieldAlert } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
          <BrainCircuit className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            EDRAS
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">PRO</span>
          </h1>
          <p className="text-xs text-indigo-300/80 font-medium tracking-wide">Early Dementia Risk Analysis System</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">HIPAA Compliant</span>
        </div>
        
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-6">
          <div className="text-right hidden sm:block">
            <p className="font-medium text-sm text-slate-200">Dr. Alex Morgan</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Chief Neurologist</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border-2 border-slate-800 flex items-center justify-center shadow-inner">
            <span className="text-sm font-bold text-slate-200">AM</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
