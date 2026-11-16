// Longitudinal record for one patient: cognitive scores over time, linked MRI scans,
// and a form that records a new MMSE/MoCA assessment through POST /api/assessments/run.
import React, { useEffect, useState } from 'react';
import { ClipboardPlus, ScanLine, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea } from 'recharts';
import { Modal } from './ui';
import { http, isNetworkError, serverMessage } from '../lib/backend';
import { useLocalState } from '../lib/hooks';

const fmt = (d, o = { day: 'numeric', month: 'short', year: 'numeric' }) => (d ? new Date(d).toLocaleDateString(undefined, o) : '—');
const ageOf = (dob) => { const d = new Date(dob); return Number.isNaN(+d) ? '—' : Math.floor((Date.now() - d) / 3.156e10); };
const TONE = {
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400',
};
const labelTone = (l = '') => TONE[l.includes('Healthy') ? 'emerald' : l.includes('MCI') ? 'amber' : 'red'];
const shortLabel = (l = '') => l.replace(/\s*\(.*\)\s*$/, '');

function localAssessment(patient_id, mmse, moca, notes) {
  const risk = Math.min(1, Math.max(0, ((30 - mmse) / 30) * 0.55 + ((30 - moca) / 30) * 0.55));
  return {
    id: Date.now(), patient_id, assessment_date: new Date().toISOString(), mmse_score: mmse, moca_score: moca, transcript_text: notes,
    dementia_risk_score: +risk.toFixed(4), confidence_interval: 0.85,
    classification_label: risk < 0.33 ? 'Healthy Control (HC)' : risk < 0.6 ? 'Mild Cognitive Impairment (MCI)' : "Alzheimer's Disease (AD)",
  };
}

export default function PatientHistory({ patient, scans, onClose }) {
  const [detail, setDetail] = useState(null);
  const [offline, setOffline] = useState(false);
  const [localLog, setLocalLog] = useLocalState('edras_local_assessments', {});
  const [mmse, setMmse] = useState(26);
  const [moca, setMoca] = useState(24);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [last, setLast] = useState(null);

  const load = () => {
    if (!patient) return;
    http.get(`/api/patients/${patient.id}`)
      .then((r) => { setDetail(r.data); setOffline(false); })
      .catch((e) => { setOffline(isNetworkError(e)); setDetail({ ...patient, assessments: [] }); });
  };
  useEffect(load, [patient?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!patient) return null;
  const key = patient.patient_uuid || patient.id;
  const assessments = [...(detail?.assessments || []), ...(offline ? localLog[key] || [] : [])]
    .sort((a, b) => (a.assessment_date || '').localeCompare(b.assessment_date || ''));
  const series = assessments.map((a) => ({ date: fmt(a.assessment_date, { day: 'numeric', month: 'short' }), MMSE: a.mmse_score, MoCA: a.moca_score }));
  const pScans = (scans || []).filter((s) => s.patient_name === patient.name);

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('patient_id', patient.id); fd.append('mmse_score', mmse); fd.append('moca_score', moca); fd.append('transcript_text', notes);
      const { data } = await http.post('/api/assessments/run', fd);
      setLast(data); load();
    } catch (e) {
      if (!isNetworkError(e)) { setErr(serverMessage(e, 'The assessment could not be saved.')); return; }
      const a = localAssessment(patient.id, mmse, moca, notes);
      setLocalLog({ ...localLog, [key]: [...(localLog[key] || []), a] });
      setLast(a); setOffline(true);
    } finally { setBusy(false); }
  };

  const band = (v, cut) => (v >= cut ? 'text-emerald-600 dark:text-emerald-400' : v >= 19 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400');

  return (
    <Modal open onClose={onClose} title={`${patient.name} · Longitudinal record`} width="max-w-5xl">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-5 text-xs">
        {[['UUID', patient.patient_uuid], ['Age', ageOf(patient.dob)], ['Sex', patient.gender || '—'], ['Education', `${patient.education_years ?? '—'} yrs`], ['Assessments', assessments.length]].map(([k, v]) => (
          <div key={k} className="p-3 rounded-2xl bg-sky-50/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{k}</p>
            <p className="font-black text-slate-900 dark:text-white font-mono truncate">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 med-panel p-5 rounded-3xl">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />Cognitive scores over time</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Shaded band: impairment range (below 24).</p>
          {series.length ? (
            <div className="h-52">
              <ResponsiveContainer>
                <LineChart data={series} margin={{ left: -22, right: 8, top: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
                  <ReferenceArea y1={0} y2={24} fill="#f59e0b" fillOpacity={0.07} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[10, 30]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Line dataKey="MMSE" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line dataKey="MoCA" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-xs text-slate-500 dark:text-slate-400 py-10 text-center">No assessments yet. Record the first one on the right.</p>}
          {assessments.length > 0 && (
            <ul className="mt-3 divide-y divide-sky-100 dark:divide-slate-800 text-xs">
              {[...assessments].reverse().slice(0, 5).map((a) => (
                <li key={a.id} className="py-2 grid grid-cols-[5rem_1fr_auto] gap-2 items-center">
                  <span className="text-slate-500 font-mono">{fmt(a.assessment_date, { day: 'numeric', month: 'short' })}</span>
                  <span className="font-mono">MMSE <b>{a.mmse_score}</b> · MoCA <b>{a.moca_score}</b></span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${labelTone(a.classification_label)}`}>{shortLabel(a.classification_label)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 med-panel p-5 rounded-3xl space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><ClipboardPlus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />Record assessment</h3>
          {[['MMSE', mmse, setMmse, 24], ['MoCA', moca, setMoca, 26]].map(([n, v, set, cut]) => (
            <div key={n}>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor={`r-${n}`} className="font-extrabold text-slate-600 dark:text-slate-300">{n} score</label>
                <span className={`font-black font-mono text-base ${band(v, cut)}`}>{v}<span className="text-slate-400 text-xs">/30</span></span>
              </div>
              <input id={`r-${n}`} type="range" min={0} max={30} value={v} onChange={(e) => set(+e.target.value)} className="w-full accent-cyan-600" />
              <p className="text-[10px] text-slate-400">Normal ≥ {cut}</p>
            </div>
          ))}
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Speech sample or clinical notes (optional)" className="field text-xs" aria-label="Notes" />
          {err && <p className="text-xs font-bold text-red-600">{err}</p>}
          <button onClick={submit} disabled={busy} className="w-full py-3 rounded-2xl btn-soft-primary font-extrabold text-xs cursor-pointer disabled:opacity-60">{busy ? 'Running model…' : 'Run AI assessment'}</button>
          {last && (
            <div className="text-xs rise p-3 rounded-2xl bg-sky-50/80 dark:bg-slate-900/80">
              <p className="font-black text-slate-900 dark:text-white">{last.classification_label}</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono">Risk {(last.dementia_risk_score * 100).toFixed(0)}% · confidence {(last.confidence_interval * 100).toFixed(0)}%{offline ? ' · saved in this browser (demo)' : ''}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 med-panel p-5 rounded-3xl">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><ScanLine className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />MRI scans</h3>
        {pScans.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pScans.map((s) => (
              <div key={s.id} className="p-3 rounded-2xl bg-sky-50/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-slate-800">
                <p className="text-[10px] font-mono text-slate-400">{fmt(s.scan_date)}</p>
                <p className="text-xl font-black font-mono text-slate-900 dark:text-white">{Number(s.dementia_risk_score).toFixed(1)}%</p>
                <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400">{s.predicted_stage}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-slate-500 dark:text-slate-400">No scans linked to this name yet. Run one from MRI 3D Scan Analysis.</p>}
      </div>
    </Modal>
  );
}
