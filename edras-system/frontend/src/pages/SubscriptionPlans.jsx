import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Sparkles, Video, Brain, Star, ArrowRight } from 'lucide-react';

export default function SubscriptionPlans({ theme }) {
  const [activePlan, setActivePlan] = useState(() => { try { return localStorage.getItem('edras_plan') || 'Quarterly Pro'; } catch { return 'Quarterly Pro'; } });
  const [upgradedSuccess, setUpgradedSuccess] = useState('');

  const plans = [
    {
      name: 'Basic Care',
      price: '$29',
      cycle: 'per month',
      popular: false,
      description: 'Essential AI Brain MRI Analysis & Medical Chatbot access for individual patient tracking.',
      features: [
        'AI Brain MRI Scan Analysis (10 scans/mo)',
        'Pretrained NeuroCare AI Chatbot 24/7',
        'Multi-format File Vault (PDF, JPG, PNG)',
        'Basic Cognitive Score Tracking'
      ]
    },
    {
      name: 'Quarterly Pro',
      price: '$79',
      cycle: 'per quarter ($26/mo)',
      popular: true,
      description: 'Complete patient & clinician telehealth package with 1-on-1 video calls & PDF reports.',
      features: [
        'Unlimited AI Brain MRI Scan Analysis',
        '5 Telehealth Video/Voice Consultations/qtr',
        'Pretrained NeuroCare AI Chatbot 24/7',
        'Multi-format File Vault (PDF, JPG, DICOM, CSV)',
        'Downloadable Clinical Diagnostic PDF Reports',
        'HIPAA AES-256 Encrypted Storage'
      ]
    },
    {
      name: 'Yearly Enterprise',
      price: '$249',
      cycle: 'per year ($20/mo)',
      popular: false,
      description: 'Comprehensive annual care suite for families, clinics, and long-term dementia research.',
      features: [
        'Unlimited AI Scans & Multi-Modal Analysis',
        'Unlimited Telehealth Video & Voice Calls',
        'Priority Specialist Doctor Consultation',
        'Longitudinal Cognitive Atrophy Trends',
        'Dedicated Clinical Account Manager',
        'Full Institutional Data Export'
      ]
    }
  ];

  const handleSelectPlan = (planName) => {
    setActivePlan(planName);
    try { localStorage.setItem('edras_plan', planName); } catch { /* ignore */ }
    setUpgradedSuccess(`Subscribed to ${planName} Plan (demo checkout, no payment taken).`);
    setTimeout(() => setUpgradedSuccess(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1 text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-full inline-flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> EDRAS MEDTECH SUBSCRIPTION PLANS
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Flexible Care Plans for Patients & Clinicians
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Access AI Brain MRI diagnostic inference, pretrained AI chatbot consultations, and 1-on-1 Telehealth Video Calls.
        </p>
      </div>

      {upgradedSuccess && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{upgradedSuccess}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {plans.map((p, idx) => {
          const isSelected = activePlan === p.name;
          return (
            <div
              key={idx}
              className={`med-panel p-8 rounded-3xl border relative flex flex-col justify-between transition-all ${
                p.popular 
                  ? 'border-cyan-500 shadow-2xl scale-105 bg-gradient-to-b from-sky-500/5 to-transparent' 
                  : 'border-sky-200/80 dark:border-slate-800'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> MOST POPULAR PLAN
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium min-h-[36px]">{p.description}</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">{p.price}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{p.cycle}</span>
                </div>

                <div className="pt-4 border-t border-sky-100 dark:border-slate-800 space-y-2.5">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleSelectPlan(p.name)}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : p.popular
                      ? 'btn-soft-primary'
                      : 'btn-soft-secondary'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <>
                      <span>Choose {p.name} Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
