import { Check, Printer, ExternalLink, Leaf } from 'lucide-react';
import { Button, PageHeader } from '../components/ui';
import { useLocalState } from '../lib/hooks';

// 2024 Lancet Commission on dementia prevention: 14 modifiable risk factors and
// their population attributable fractions (share of dementia cases worldwide).
const FACTORS = [
  { id: 'edu', stage: 'Early life', name: 'Less education', paf: 5, q: 'Fewer than 12 years of formal education', act: 'Keep learning: a language, an instrument, a course. Cognitive reserve keeps growing at any age.' },
  { id: 'hearing', stage: 'Midlife', name: 'Hearing loss', paf: 7, q: 'Trouble following conversations, or untreated hearing loss', act: 'Get a hearing test and use hearing aids if advised. Protect ears from loud noise.' },
  { id: 'ldl', stage: 'Midlife', name: 'High LDL cholesterol', paf: 7, q: 'LDL above target, or not checked in 5 years', act: 'Check cholesterol from age 40. Lower high LDL with diet, activity, and statins if your doctor prescribes them.' },
  { id: 'depression', stage: 'Midlife', name: 'Depression', paf: 3, q: 'Low mood most days for two weeks or more', act: 'Talk to a doctor or counsellor. Treating depression is linked to lower dementia risk.' },
  { id: 'tbi', stage: 'Midlife', name: 'Head injury', paf: 3, q: 'Past concussion, or contact sports / riding without a helmet', act: 'Wear helmets for cycling and two-wheelers; use seatbelts; reduce fall hazards at home.' },
  { id: 'inactive', stage: 'Midlife', name: 'Physical inactivity', paf: 2, q: 'Less than 150 minutes of moderate exercise a week', act: 'Build to 150 minutes a week of brisk walking, cycling or swimming, plus two strength sessions.' },
  { id: 'diabetes', stage: 'Midlife', name: 'Diabetes', paf: 2, q: 'Diagnosed diabetes or high blood sugar', act: 'Keep HbA1c in your target range; regular reviews with your doctor.' },
  { id: 'smoking', stage: 'Midlife', name: 'Smoking', paf: 2, q: 'Currently smoke or use tobacco', act: 'Stopping helps at any age. Ask about cessation support and nicotine replacement.' },
  { id: 'bp', stage: 'Midlife', name: 'Hypertension', paf: 2, q: 'Blood pressure above 130/80, or not checked recently', act: 'Aim for systolic 130 mmHg or lower from age 40. Reduce salt; take medication as prescribed.' },
  { id: 'obesity', stage: 'Midlife', name: 'Obesity', paf: 1, q: 'BMI of 30 or more', act: 'Small sustained changes: more vegetables and pulses, fewer refined carbs, regular movement.' },
  { id: 'alcohol', stage: 'Midlife', name: 'Excessive alcohol', paf: 1, q: 'More than 21 units a week (about 10 drinks)', act: 'Keep under 14 units a week, with alcohol-free days.' },
  { id: 'isolation', stage: 'Late life', name: 'Social isolation', paf: 5, q: 'Rarely meet or talk with friends and family', act: 'Schedule regular contact: a weekly call, a community group, volunteering, shared meals.' },
  { id: 'pollution', stage: 'Late life', name: 'Air pollution', paf: 3, q: 'Live or work near heavy traffic or smoke', act: 'Use air-quality alerts, avoid busy roads for walks, ventilate cooking smoke.' },
  { id: 'vision', stage: 'Late life', name: 'Untreated vision loss', paf: 2, q: 'Blurred vision, cataracts, or no eye test in 2 years', act: 'Have an eye test; treat cataracts and use the right glasses.' },
];
const STAGES = ['Early life', 'Midlife', 'Late life'];
const TOTAL = FACTORS.reduce((a, f) => a + f.paf, 0);

export default function RiskPlan() {
  const [answers, setAnswers] = useLocalState('edras_risk', {});
  const set = (id, v) => setAnswers({ ...answers, [id]: answers[id] === v ? undefined : v });
  const flagged = FACTORS.filter((f) => answers[f.id] === 'yes').sort((a, b) => b.paf - a.paf);
  const managed = FACTORS.filter((f) => answers[f.id] === 'managed');
  const answered = FACTORS.filter((f) => answers[f.id]).length;
  const flaggedShare = flagged.reduce((a, f) => a + f.paf, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <PageHeader
        badge="LANCET 2024 PREVENTION PLANNER" badgeIcon={Leaf}
        title="Risk factors you can change"
        subtitle="The 2024 Lancet Commission found 14 modifiable factors linked to about 45% of dementia cases worldwide. Mark the ones that apply to you to get a personal plan."
        actions={flagged.length > 0 && <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4" />Print my plan</Button>}
      />

      {/* Share bar: each factor's slice of the 45% */}
      <div className="panel p-6 mb-6 no-print">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
          <p className="font-bold">Share of dementia cases linked to each factor</p>
          <p className="text-sm text-muted">{answered}/14 answered</p>
        </div>
        <div className="flex h-10 rounded-xl overflow-hidden gap-[2px]" role="img" aria-label={`Factors you flagged account for ${flaggedShare} of ${TOTAL} percentage points`}>
          {FACTORS.map((f) => {
            const a = answers[f.id];
            return (
              <div key={f.id} title={`${f.name}: ${f.paf}%`} style={{ flex: f.paf }}
                className={`transition-colors ${a === 'yes' ? 'bg-amber' : a === 'managed' ? 'bg-tide' : a === 'no' ? 'bg-surface-2' : 'bg-synapse-soft'}`} />
            );
          })}
          <div style={{ flex: 100 - TOTAL }} className="bg-line/50 grid place-items-center text-xs text-muted">not modifiable (~55%)</div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber" />Applies to me</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-tide" />Already managing</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-surface-2 border border-line" />Doesn’t apply</span>
        </div>
        <p className="text-xs text-muted mt-3">These are population-level figures, not your personal odds — factors overlap, and anyone’s risk also depends on age and genetics.</p>
      </div>

      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6 no-print">
          {STAGES.map((stage) => (
            <section key={stage} className="panel p-6">
              <h2 className="text-lg font-bold mb-1">{stage}</h2>
              <p className="text-sm text-muted mb-4">{stage === 'Early life' ? 'Under 18' : stage === 'Midlife' ? 'Roughly 18–65' : 'Over 65'} — when the evidence shows the strongest effect</p>
              <ul className="divide-y divide-line">
                {FACTORS.filter((f) => f.stage === stage).map((f) => (
                  <li key={f.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <p className="font-bold">{f.name} <span className="text-muted font-normal text-sm tnum">· {f.paf}% of cases</span></p>
                      <p className="text-sm text-ink-soft">{f.q}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0" role="group" aria-label={f.name}>
                      {[['yes', 'Applies', 'amber'], ['managed', 'Managing', 'tide'], ['no', 'No', 'synapse']].map(([v, l, tone]) => (
                        <button key={v} onClick={() => set(f.id, v)} aria-pressed={answers[f.id] === v}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${answers[f.id] === v ? `bg-${tone}-soft text-${tone} border-transparent` : 'border-line text-ink-soft hover:bg-surface-2'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="xl:sticky xl:top-24 h-fit space-y-6">
          <div className="panel p-6">
            <h2 className="text-xl font-bold">Your plan</h2>
            {flagged.length === 0 ? (
              <p className="text-ink-soft mt-2">{answered === 0 ? 'Answer the questions on the left. Factors you mark “Applies” will appear here as concrete next steps, biggest impact first.' : 'Nothing flagged yet — great. Keep doing what you’re doing.'}</p>
            ) : (
              <>
                <p className="text-ink-soft mt-1 mb-4">Start at the top: these carry the largest share of preventable cases.</p>
                <ol className="space-y-4">
                  {flagged.map((f, i) => (
                    <li key={f.id} className="flex gap-3">
                      <span className="w-7 h-7 rounded-full bg-amber-soft text-amber font-bold grid place-items-center shrink-0 text-sm">{i + 1}</span>
                      <div><p className="font-bold">{f.name}</p><p className="text-sm text-ink-soft">{f.act}</p></div>
                    </li>
                  ))}
                </ol>
              </>
            )}
            {managed.length > 0 && (
              <div className="mt-5 pt-4 border-t border-line">
                <p className="text-sm font-bold text-tide flex items-center gap-1.5"><Check className="w-4 h-4" />Already managing</p>
                <p className="text-sm text-ink-soft mt-1">{managed.map((f) => f.name).join(', ')}</p>
              </div>
            )}
          </div>
          <a href="https://www.thelancet.com/commissions/dementia-prevention-intervention-care" target="_blank" rel="noreferrer"
            className="no-print panel p-4 flex items-center justify-between text-sm hover:border-synapse">
            <span><b>Source:</b> Lancet Commission on dementia prevention, 2024</span><ExternalLink className="w-4 h-4 text-muted" />
          </a>
        </aside>
      </div>
    </div>
  );
}
