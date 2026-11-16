import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpenText, Palette, Waypoints, Zap, Play, RotateCcw, Trophy, Puzzle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button, PageHeader, Empty } from '../components/ui';
import { useLocalState, fmtDate } from '../lib/hooks';

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const TESTS = [
  { id: 'recall', name: 'Word recall', icon: BookOpenText, skill: 'Short-term memory', time: '1 min', how: 'Memorise five words, then type as many as you remember.' },
  { id: 'stroop', name: 'Colour clash', icon: Palette, skill: 'Attention & inhibition', time: '1 min', how: 'Pick the ink colour of each word, not what the word says.' },
  { id: 'trails', name: 'Trail link', icon: Waypoints, skill: 'Executive function', time: '1 min', how: 'Tap 1 → A → 2 → B … alternating numbers and letters.' },
  { id: 'reaction', name: 'Quick tap', icon: Zap, skill: 'Processing speed', time: '30 sec', how: 'Tap as soon as the panel turns green. Five rounds.' },
];

/* ---------- Word recall ---------- */
const WORD_BANK = ['Mango', 'Temple', 'River', 'Violin', 'Pepper', 'Candle', 'Monsoon', 'Lantern', 'Saffron', 'Harbour', 'Tiger', 'Blanket', 'Kettle', 'Garden', 'Mirror', 'Rocket'];
function Recall({ onFinish }) {
  const words = useMemo(() => shuffle(WORD_BANK).slice(0, 5), []);
  const [phase, setPhase] = useState('learn');
  const [left, setLeft] = useState(12);
  const [count, setCount] = useState(100);
  const [answer, setAnswer] = useState('');
  useEffect(() => {
    if (phase !== 'learn') return;
    if (left <= 0) { setPhase('distract'); return; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, phase]);
  if (phase === 'learn') return (
    <div className="text-center">
      <p className="text-muted mb-6">Remember these words. {left}s left.</p>
      <div className="flex flex-wrap justify-center gap-3">{words.map((w) => <span key={w} className="font-black text-3xl font-bold px-5 py-3 rounded-2xl bg-synapse-soft text-synapse">{w}</span>)}</div>
      <Button variant="ghost" className="mt-6" onClick={() => setLeft(0)}>I’ve got them</Button>
    </div>
  );
  if (phase === 'distract') return (
    <div className="text-center max-w-md mx-auto">
      <p className="text-muted">Quick distraction: keep subtracting 7 from the number.</p>
      <p className="font-black text-6xl font-bold tnum my-6">{count}</p>
      <div className="flex justify-center gap-2">
        <Button variant="soft" onClick={() => (count - 7 < 65 ? setPhase('recall') : setCount(count - 7))}>Subtract 7</Button>
        <Button variant="ghost" onClick={() => setPhase('recall')}>Skip</Button>
      </div>
    </div>
  );
  const submit = () => {
    const typed = answer.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const hits = words.filter((w) => typed.includes(w.toLowerCase()));
    onFinish(hits.length * 20, `${hits.length}/5 words`, { missed: words.filter((w) => !hits.includes(w)) });
  };
  return (
    <div className="max-w-md mx-auto">
      <label htmlFor="recall" className="block font-bold mb-2">Type every word you remember</label>
      <textarea id="recall" autoFocus rows={3} className="field text-lg" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Separate with spaces or commas" />
      <Button className="mt-4 w-full" onClick={submit}>Check my answers</Button>
    </div>
  );
}

/* ---------- Stroop ---------- */
const COLOURS = [['Red', '#d0485f'], ['Blue', '#3b6fe0'], ['Green', '#1f9e8f'], ['Yellow', '#d4a017']];
function Stroop({ onFinish }) {
  const N = 12;
  const trials = useMemo(() => Array.from({ length: N }, () => {
    const w = Math.floor(Math.random() * 4); let ink = Math.floor(Math.random() * 4);
    if (Math.random() < 0.75) while (ink === w) ink = Math.floor(Math.random() * 4);
    return { word: COLOURS[w][0], ink };
  }), []);
  const [i, setI] = useState(0);
  const [log, setLog] = useState([]);
  const start = useRef(performance.now());
  useEffect(() => { start.current = performance.now(); }, [i]);
  const pick = (c) => {
    const entry = { ok: c === trials[i].ink, rt: performance.now() - start.current };
    const next = [...log, entry];
    if (i + 1 >= N) {
      const acc = next.filter((e) => e.ok).length / N;
      const rt = next.reduce((a, e) => a + e.rt, 0) / N;
      onFinish(Math.round(acc * 70 + clamp((1600 - rt) / 1000, 0, 1) * 30), `${Math.round(acc * 100)}% correct · ${Math.round(rt)} ms avg`);
    } else { setLog(next); setI(i + 1); }
  };
  const t = trials[i];
  return (
    <div className="text-center">
      <p className="text-muted">Trial {i + 1} of {N} — choose the ink colour</p>
      <p className="font-black text-7xl font-extrabold my-10 select-none" style={{ color: COLOURS[t.ink][1] }}>{t.word}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
        {COLOURS.map(([n, hex], c) => (
          <button key={n} onClick={() => pick(c)} className="py-4 rounded-xl border-2 border-line font-bold text-lg hover:border-ink flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full" style={{ background: hex }} />{n}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Trail making B ---------- */
function Trails({ onFinish }) {
  const seq = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
  const nodes = useMemo(() => {
    const placed = [];
    for (const label of seq) {
      let p, tries = 0;
      do { p = { x: 8 + Math.random() * 84, y: 10 + Math.random() * 80 }; tries++; }
      while (tries < 200 && placed.some((q) => Math.hypot(q.x - p.x, (q.y - p.y) * 0.6) < 14));
      placed.push({ ...p, label });
    }
    return placed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [next, setNext] = useState(0);
  const [errors, setErrors] = useState(0);
  const [wrong, setWrong] = useState(null);
  const t0 = useRef(null);
  const tap = (idx) => {
    if (t0.current === null) t0.current = performance.now();
    if (idx === next) {
      if (next + 1 === seq.length) {
        const s = (performance.now() - t0.current) / 1000;
        onFinish(Math.round(clamp(((70 - s) / 55) * 100 - errors * 6)), `${s.toFixed(1)} s · ${errors} wrong taps`);
      } else setNext(next + 1);
    } else { setErrors(errors + 1); setWrong(idx); setTimeout(() => setWrong(null), 350); }
  };
  return (
    <div>
      <p className="text-center text-muted mb-3">Next: <b className="text-ink text-lg">{seq[next]}</b> · wrong taps {errors}</p>
      <div className="relative h-[360px] rounded-2xl bg-surface-2 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {nodes.slice(0, Math.max(0, next - 1)).map((n, i) => (
            <line key={i} x1={n.x} y1={n.y} x2={nodes[i + 1].x} y2={nodes[i + 1].y} stroke="var(--synapse)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {nodes.map((n, i) => (
          <button key={n.label} onClick={() => tap(i)} aria-label={`Node ${n.label}`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full font-black font-bold text-lg grid place-items-center border-2 transition-colors
              ${i < next ? 'bg-synapse text-white border-synapse dark:text-[#0f1426]' : wrong === i ? 'bg-rose-soft border-rose text-rose' : 'bg-surface border-line hover:border-ink'}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Reaction ---------- */
function Reaction({ onFinish }) {
  const [state, setState] = useState('wait');
  const [times, setTimes] = useState([]);
  const [msg, setMsg] = useState('');
  const timer = useRef(); const go = useRef(0);
  const arm = () => {
    setState('wait'); setMsg('');
    timer.current = setTimeout(() => { go.current = performance.now(); setState('go'); }, 1200 + Math.random() * 2200);
  };
  useEffect(() => { arm(); return () => clearTimeout(timer.current); }, []);
  const tap = () => {
    if (state === 'wait') { clearTimeout(timer.current); setMsg('Too early — wait for green.'); setTimeout(arm, 900); return; }
    if (state !== 'go') return;
    const rt = performance.now() - go.current;
    const next = [...times, rt];
    setTimes(next); setState('done');
    if (next.length >= 5) {
      const avg = next.reduce((a, b) => a + b, 0) / next.length;
      setTimeout(() => onFinish(Math.round(clamp(((560 - avg) / 300) * 100)), `${Math.round(avg)} ms average`), 400);
    } else setTimeout(arm, 700);
  };
  return (
    <button onClick={tap} className={`w-full h-72 rounded-2xl grid place-items-center text-center transition-colors ${state === 'go' ? 'bg-tide text-white' : 'bg-surface-2'}`}>
      <span>
        <span className="block font-black text-3xl font-bold">{state === 'go' ? 'Tap!' : msg || (state === 'done' ? `${Math.round(times[times.length - 1])} ms` : 'Wait for green…')}</span>
        <span className="block text-sm mt-2 opacity-80">Round {Math.min(times.length + 1, 5)} of 5</span>
      </span>
    </button>
  );
}

const RUNNERS = { recall: Recall, stroop: Stroop, trails: Trails, reaction: Reaction };

export default function BrainGym() {
  const [history, setHistory] = useLocalState('edras_gym', []);
  const [active, setActive] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const [done, setDone] = useState(null);

  const latest = Object.fromEntries(TESTS.map((t) => [t.id, [...history].reverse().find((h) => h.test === t.id)]));
  const scored = Object.values(latest).filter(Boolean);
  const composite = scored.length ? Math.round(scored.reduce((a, h) => a + h.score, 0) / scored.length) : null;

  const daily = useMemo(() => {
    const byDay = {};
    history.forEach((h) => { const d = h.date.slice(0, 10); (byDay[d] ||= []).push(h.score); });
    return Object.entries(byDay).sort().map(([d, arr]) => ({ day: fmtDate(d, { day: 'numeric', month: 'short' }), score: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }));
  }, [history]);

  const finish = (score, detail, extra) => {
    const entry = { test: active, score: clamp(score), detail, date: new Date().toISOString() };
    setHistory((h) => [...h, entry].slice(-200));
    setDone({ ...entry, extra });
  };
  const start = (id) => { setActive(id); setDone(null); setRunKey((k) => k + 1); };
  const Runner = active && RUNNERS[active];
  const test = TESTS.find((t) => t.id === active);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <PageHeader badge="COGNITIVE FITNESS LAB" badgeIcon={Puzzle} title="Brain Gym" subtitle="Four short tests modelled on clinical screens. Take them weekly to build a personal baseline — a change over time matters more than any single score." />

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {TESTS.map((t) => (
          <button key={t.id} onClick={() => start(t.id)}
            className={`text-left p-5 rounded-2xl border transition-colors ${active === t.id ? 'border-synapse bg-synapse-soft' : 'border-line bg-surface hover:border-ink-soft'}`}>
            <div className="flex items-center justify-between">
              <t.icon className="w-6 h-6 text-synapse" />
              {latest[t.id] && <span className="font-black font-bold text-xl tnum">{latest[t.id].score}</span>}
            </div>
            <p className="font-bold text-lg mt-3">{t.name}</p>
            <p className="text-sm text-muted">{t.skill} · {t.time}</p>
          </button>
        ))}
      </div>

      <div className={`panel p-6 md:p-8 mb-6 ${active ? 'min-h-[22rem]' : ''}`}>
        {!active && (
          <div className="grid md:grid-cols-[auto_1fr] items-center gap-8">
            <div className="w-40 h-40 rounded-full border-[10px] border-synapse-soft grid place-items-center mx-auto">
              <span className="text-center">
                <span className="block font-black text-5xl font-bold tnum">{composite ?? '—'}</span>
                <span className="text-xs text-muted">fitness score</span>
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{composite === null ? 'Start with any test' : 'Your cognitive fitness'}</h2>
              <p className="text-ink-soft mt-2 max-w-xl">{composite === null
                ? 'Each test takes about a minute. Your composite score is the average of your latest result on every test you’ve taken.'
                : `Based on ${scored.length} of 4 tests. Retake them on the same day each week, at a similar time, for the most comparable results.`}</p>
              <Button className="mt-5" onClick={() => start(TESTS.find((t) => !latest[t.id])?.id || 'recall')}><Play className="w-4 h-4" />{composite === null ? 'Take word recall' : 'Continue'}</Button>
            </div>
          </div>
        )}
        {active && !done && (
          <div key={runKey}>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-bold">{test.name}</h2><p className="text-sm text-muted">{test.how}</p></div>
              <Button variant="ghost" size="sm" onClick={() => setActive(null)}>Exit</Button>
            </div>
            <Runner onFinish={finish} />
          </div>
        )}
        {done && (
          <div className="text-center py-6 rise">
            <Trophy className="w-10 h-10 mx-auto text-amber" />
            <p className="font-black text-6xl font-bold tnum mt-3">{done.score}</p>
            <p className="text-muted">{test.name} · {done.detail}</p>
            {done.extra?.missed?.length > 0 && <p className="text-sm text-ink-soft mt-2">Missed: {done.extra.missed.join(', ')}</p>}
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" onClick={() => start(active)}><RotateCcw className="w-4 h-4" />Try again</Button>
              <Button onClick={() => { const i = TESTS.findIndex((t) => t.id === active); start(TESTS[(i + 1) % TESTS.length].id); }}>Next test</Button>
            </div>
          </div>
        )}
      </div>

      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-lg font-bold">Progress</h2><p className="text-sm text-muted">Daily average across all tests</p></div>
          {history.length > 0 && <Button variant="ghost" size="sm" onClick={() => setHistory([])}>Clear history</Button>}
        </div>
        {daily.length > 1 ? (
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={daily} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }} />
                <Line dataKey="score" stroke="var(--synapse)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : history.length ? (
          <ul className="divide-y divide-line">
            {[...history].reverse().slice(0, 6).map((h, i) => (
              <li key={i} className="py-2.5 flex justify-between text-sm"><span>{TESTS.find((t) => t.id === h.test)?.name}</span><span className="text-muted">{h.detail}</span><b className="tnum">{h.score}</b></li>
            ))}
          </ul>
        ) : <Empty title="No results yet">Your trend chart appears after tests on two different days.</Empty>}
      </div>
    </div>
  );
}
