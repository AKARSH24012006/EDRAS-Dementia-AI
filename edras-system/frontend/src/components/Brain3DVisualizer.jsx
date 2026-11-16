import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * EDRAS 3D Brain & Neural Volumetric Mesh Visualizer (v3)
 *
 * An anatomically shaped point-cloud brain: two cerebral hemispheres with gyri,
 * temporal lobes, cerebellum and brainstem, plus the two structures that matter
 * most in dementia: the hippocampi and the lateral ventricles.
 *
 * Region colour follows the scan:
 *   - hippocampus warms (emerald → amber → red) as volume falls
 *   - ventricles warm as they enlarge
 *   - cortex shifts from cyan toward amber/rose as integrity drops
 * Pass the real biomarkers (hippocampal / ventricular / cortical) when you have
 * them; otherwise they are estimated from riskScore.
 *
 * Same props and controls as the original component, plus:
 *  - crisp at any size (device-pixel-ratio aware, resizes with its card)
 *  - drag / touch / arrow-key rotation that no longer snaps back
 *  - travelling synaptic signals; respects reduced-motion
 */

const REGION_INFO = {
  cortex: 'Cortex: thinking, language and planning. Thins across temporal and parietal lobes in dementia.',
  hippocampus: 'Hippocampus: forms new memories. Usually the first structure to shrink in Alzheimer’s.',
  ventricles: 'Ventricles: fluid spaces in the centre. They widen as surrounding tissue is lost.',
};

// deterministic RNG so the brain looks identical on every render
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function buildBrain() {
  const r = rng(7);
  const pts = [];
  const push = (x, y, z, region) => pts.push({ x, y, z, region, phase: r() * Math.PI * 2, roll: r() });

  // Cerebral hemispheres: ellipsoid surface with gyri ripple, split by the longitudinal fissure
  for (let i = 0; i < 760; i++) {
    const u = r() * 2 - 1;
    const th = r() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    let x = s * Math.cos(th);
    let y = u;
    let z = s * Math.sin(th);
    const ripple = 1 + 0.05 * Math.sin(10 * th + 4 * u) * Math.cos(8 * u + th);
    x *= 0.72 * ripple; y *= 0.58 * ripple; z *= 0.96 * ripple;
    if (y < -0.18 && z < -0.42) continue;            // leave room for the cerebellum
    if (y < -0.28 && Math.abs(z) < 0.5) { x *= 1.06; y = -0.28 + (y + 0.28) * 0.7; } // temporal lobes
    if (y < -0.4) continue;                           // flat base
    x += Math.sign(x || 1) * 0.045;                   // fissure between hemispheres
    push(x, y + 0.08, z, 'cortex');
  }
  // Hippocampi: curved tubes in the medial temporal lobes
  for (const side of [-1, 1]) {
    for (let i = 0; i < 42; i++) {
      const t = i / 41;
      push(
        side * (0.33 + 0.05 * Math.sin(t * 3)) + (r() - 0.5) * 0.05,
        -0.2 + 0.14 * t * t + (r() - 0.5) * 0.05,
        0.2 - t * 0.55 + (r() - 0.5) * 0.04,
        'hippocampus',
      );
    }
  }
  // Lateral ventricles: C-shaped, close to the midline
  for (const side of [-1, 1]) {
    for (let i = 0; i < 46; i++) {
      const t = i / 45;
      const a = Math.PI * (0.15 + t * 1.15);
      push(side * (0.12 + (r() - 0.5) * 0.05), 0.1 + Math.sin(a) * 0.19 + (r() - 0.5) * 0.04, Math.cos(a) * 0.4 + (r() - 0.5) * 0.04, 'ventricles');
    }
  }
  // Cerebellum (folded, at the back-bottom) and brainstem
  for (let i = 0; i < 120; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const fold = 1 + 0.06 * Math.sin(16 * u);
    push(s * Math.cos(th) * 0.5 * fold, -0.42 + u * 0.17, -0.62 + s * Math.sin(th) * 0.26, 'cerebellum');
  }
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    push((r() - 0.5) * 0.1, -0.35 - t * 0.38, -0.18 - t * 0.08 + (r() - 0.5) * 0.06, 'cerebellum');
  }

  // Synaptic edges: 2 nearest neighbours inside the same region
  const edges = [];
  for (let i = 0; i < pts.length; i++) {
    let a = [Infinity, -1], b = [Infinity, -1];
    for (let j = 0; j < pts.length; j++) {
      if (i === j || pts[i].region !== pts[j].region) continue;
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < a[0]) { b = a; a = [d, j]; } else if (d < b[0]) b = [d, j];
    }
    for (const [d, j] of [a, b]) if (j > i && d < 0.045) edges.push([i, j]);
  }
  return { pts, edges };
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
// emerald → amber → red  (original EDRAS risk palette)
const SEV = { ok: [16, 185, 129], warn: [245, 158, 11], bad: [239, 68, 68] };
const sevColor = (t) => (t < 0.5 ? mix(SEV.ok, SEV.warn, t * 2) : mix(SEV.warn, SEV.bad, (t - 0.5) * 2));

export default function Brain3DVisualizer({
  riskScore = 25,
  stage = 'Non Demented',
  height = 360,
  interactive = true,
  showControls = true,
  theme = 'light',
  hippocampal,   // optional real biomarkers from the scan
  ventricular,
  cortical,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const { pts, edges } = useMemo(buildBrain, []);
  const view = useRef({ rx: -0.28, ry: 0.55, zoom: 1, vy: 0 });
  const drag = useRef(null);
  const idleUntil = useRef(0);
  const [rotDeg, setRotDeg] = useState(32);
  const [activeLayer, setActiveLayer] = useState('all');

  // Severity per region (0 = healthy, 1 = severe)
  const risk = Number(riskScore) || 0;
  const sev = {
    hippocampus: clamp01(hippocampal != null ? (95 - hippocampal) / 45 : (risk - 10) / 80),
    ventricles: clamp01(ventricular != null ? (ventricular - 18) / 72 : (risk - 15) / 80),
    cortex: clamp01(cortical != null ? (93 - cortical) / 42 : (risk - 20) / 85),
  };
  const live = useRef({ sev, layer: activeLayer, theme });
  live.current = { sev, layer: activeLayer, theme };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf, w = 0, h = 0, last = performance.now(), lastLabel = 0;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let alive = true;
    const resize = () => {
      if (!alive || !wrapRef.current) return; // can fire after the brain was unmounted
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrapRef.current.clientWidth; h = height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current);

    const pulses = Array.from({ length: 30 }, () => ({ e: Math.floor(Math.random() * edges.length), t: Math.random() }));

    const frame = (now) => {
      const dt = Math.min(48, now - last); last = now;
      const V = view.current;
      const { sev: S, layer, theme: th } = live.current;
      const dark = th === 'dark';
      if (!drag.current && now > idleUntil.current) V.ry += (reduce ? 0.00018 : 0.00028) * dt;
      V.ry += V.vy; V.vy *= 0.92;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.44;
      const scale = Math.min(w * 0.4, h * 0.56) * V.zoom;
      const cX = Math.cos(V.rx), sX = Math.sin(V.rx), cY = Math.cos(V.ry), sY = Math.sin(V.ry);

      // Orbit ring (kept from the original look), drawn under the brain
      ctx.save();
      ctx.setLineDash([4, 7]);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = dark ? 'rgba(6,182,212,0.22)' : 'rgba(2,132,199,0.18)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + scale * 0.62, scale * 0.95, scale * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Project
      const P = new Array(pts.length);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const x1 = p.x * cY - p.z * sY;
        const z1 = p.x * sY + p.z * cY;
        const y1 = p.y * cX - z1 * sX;
        const z2 = p.y * sX + z1 * cX;
        const persp = 2.8 / (2.8 + z2);
        P[i] = { x: cx + x1 * scale * persp, y: cy - y1 * scale * persp, z: z2, s: persp };
      }

      // Colours (original EDRAS palette)
      const cortexBase = dark ? [6, 182, 212] : [2, 132, 199];
      const col = {
        cortex: cortexBase,
        hippocampus: sevColor(S.hippocampus),
        ventricles: S.ventricles < 0.3 ? [59, 130, 246] : sevColor(S.ventricles),
        cerebellum: dark ? [100, 116, 139] : [148, 163, 184],
      };
      const alphaOf = (region, z) => {
        const depth = 0.3 + 0.7 * (1 - (z + 1) / 2);
        if (layer !== 'all' && layer !== region) return depth * 0.08;
        return region === 'cortex' ? depth * 0.8 : depth;
      };

      // Edges
      ctx.lineWidth = 0.7;
      for (const [i, j] of edges) {
        const a = P[i], b = P[j], reg = pts[i].region;
        const al = alphaOf(reg, (a.z + b.z) / 2) * 0.4;
        if (al < 0.02) continue;
        const [r, g, bl] = col[reg];
        ctx.strokeStyle = `rgba(${r},${g},${bl},${al})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      // Nodes, back to front
      const order = P.map((_, i) => i).sort((a, b) => P[b].z - P[a].z);
      const beat = 0.5 + 0.5 * Math.sin(now / 480);
      for (const i of order) {
        const p = P[i], reg = pts[i].region;
        // Cortex stays cyan; atrophy shows as amber/red spots in temporal & parietal areas,
        // more of them as cortical integrity drops.
        const hot = reg === 'cortex' && pts[i].y < 0.15 && Math.abs(pts[i].z) < 0.75 && pts[i].roll < S.cortex * 0.9;
        const [r, g, b] = hot ? sevColor(0.55 + S.cortex * 0.45) : col[reg];
        const al = alphaOf(reg, p.z);
        const deep = reg === 'hippocampus' || reg === 'ventricles';
        const sz = (deep ? 2.4 + (S[reg] || 0) * 1.6 * beat : 1.6 + 0.4 * Math.sin(now / 700 + pts[i].phase)) * p.s;
        if (deep && (layer === 'all' || layer === reg) && (S[reg] > 0.35 || layer === reg)) {
          ctx.fillStyle = `rgba(${r},${g},${b},${0.07 * beat + 0.03})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, sz * 3, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${al})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, 6.283); ctx.fill();
      }

      // Travelling synaptic signals
      if (!reduce) {
        for (const pu of pulses) {
          pu.t += dt * 0.0015;
          if (pu.t > 1) { pu.t = 0; pu.e = Math.floor(Math.random() * edges.length); }
          const [i, j] = edges[pu.e];
          if (layer !== 'all' && pts[i].region !== layer) continue;
          const a = P[i], b = P[j];
          const [r, g, bl] = col[pts[i].region];
          ctx.fillStyle = `rgba(${r},${g},${bl},0.95)`;
          ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * pu.t, a.y + (b.y - a.y) * pu.t, 2, 0, 6.283); ctx.fill();
        }
      }

      if (now - lastLabel > 120) {
        lastLabel = now;
        setRotDeg(Math.round(((V.ry * 180) / Math.PI) % 360 + 360) % 360);
      }
      if (alive) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, [pts, edges, height]);

  // Pointer (mouse + touch) rotation: state lives in refs, so it never snaps back
  const onDown = (e) => {
    if (!interactive) return;
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    const V = view.current;
    V.ry += dx * 0.008; V.vy = dx * 0.0005;
    V.rx = Math.max(-1.2, Math.min(1.2, V.rx + dy * 0.006));
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { if (drag.current) idleUntil.current = performance.now() + 2500; drag.current = null; };
  const onKey = (e) => {
    const V = view.current;
    const map = { ArrowLeft: () => (V.ry -= 0.15), ArrowRight: () => (V.ry += 0.15), ArrowUp: () => (V.rx -= 0.1), ArrowDown: () => (V.rx += 0.1) };
    if (map[e.key]) { e.preventDefault(); map[e.key](); idleUntil.current = performance.now() + 2500; }
  };

  const layers = [['all', 'Full Mesh'], ['cortex', 'Cortex'], ['hippocampus', 'Hippocampus'], ['ventricles', 'Ventricles']];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden med-panel border border-sky-200/80 dark:border-slate-800 p-2 shadow-xl group">
      {/* HUD header */}
      <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-700 dark:text-cyan-400">3D VOLUMETRIC MRI MESH</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md border border-sky-200/50 dark:border-slate-800">
          ROT: {rotDeg}°
        </div>
      </div>

      {/* Region explanation when a layer is isolated */}
      {activeLayer !== 'all' && (
        <p className="absolute top-9 left-4 right-4 z-10 text-[11px] font-medium text-slate-600 dark:text-slate-300 pointer-events-none max-w-sm">
          {REGION_INFO[activeLayer]}
        </p>
      )}

      <div ref={wrapRef} style={{ height }}>
        <canvas
          ref={canvasRef}
          role="img"
          tabIndex={interactive ? 0 : -1}
          aria-label={`3D brain model, ${stage}, risk ${risk}%. Drag or use arrow keys to rotate.`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          onKeyDown={onKey}
          className={`block select-none touch-none ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
        />
      </div>

      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 items-center justify-between z-10">
          <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-xl border border-sky-200/60 dark:border-slate-800 backdrop-blur-sm text-[10px] font-semibold overflow-x-auto max-w-full">
            {layers.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveLayer(id)}
                aria-pressed={activeLayer === id}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeLayer === id
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
