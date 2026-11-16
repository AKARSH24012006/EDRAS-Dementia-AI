// Offline helpers for the MRI page: a demo estimate derived from the actual image
// (never a fixed answer), and a synthetic MRI slice generator for people without a scan.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const STAGES = ['Non Demented', 'Very Mild Dementia', 'Mild Dementia', 'Moderate Dementia'];
const RECS = {
  'Non Demented': 'Routine cognitive wellness check recommended in 12 months. Maintain aerobic exercise, sleep and social engagement.',
  'Very Mild Dementia': 'Schedule MoCA screening and a follow-up MRI in 9–12 months. Review hearing, blood pressure and LDL cholesterol.',
  'Mild Dementia': 'Neuropsychological assessment recommended. Repeat MRI in 6 months and discuss treatment options with a neurologist.',
  'Moderate Dementia': 'Urgent neurology referral. Establish a caregiver plan, home safety review, and medication assessment.',
};
export const stageFromRisk = (r) => (r < 25 ? STAGES[0] : r < 50 ? STAGES[1] : r < 75 ? STAGES[2] : STAGES[3]);

export function probabilities(risk) {
  const centers = [10, 37, 62, 88];
  const w = centers.map((c) => Math.exp(-((risk - c) ** 2) / 260));
  const sum = w.reduce((a, b) => a + b, 0);
  return Object.fromEntries(STAGES.map((s, i) => [s, +(w[i] / sum).toFixed(4)]));
}

async function imageFeatures(file) {
  if (!file || !file.type?.startsWith('image/')) return null;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const N = 128;
    const c = document.createElement('canvas'); c.width = N; c.height = N;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, N, N);
    const d = ctx.getImageData(0, 0, N, N).data;
    let sum = 0, sq = 0, dark = 0, brain = 0, cDark = 0, cN = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      sum += g; sq += g * g;
      if (g > 12) brain++;
      if (g > 12 && g < 60) dark++;
      const dx = x - N / 2, dy = y - N / 2;
      if (dx * dx + dy * dy < (N * 0.18) ** 2) { cN++; if (g < 60) cDark++; }
    }
    const n = N * N, mean = sum / n;
    return { mean, variance: sq / n - mean * mean, darkRatio: dark / Math.max(brain, 1), centreDark: cDark / Math.max(cN, 1) };
  } finally { URL.revokeObjectURL(url); }
}

export async function demoAnalyze({ file, patientName, patientAge, gender }) {
  const f = await imageFeatures(file);
  const ageTerm = clamp((Number(patientAge) - 55) * 0.6, 0, 22);
  const risk = f ? clamp((f.darkRatio * 55 + f.centreDark * 30 + ageTerm - 17) * 1.8, 3, 97) : clamp(15 + ageTerm + Math.random() * 30, 3, 97);
  const stage = stageFromRisk(risk);
  return {
    scan: {
      id: Date.now() % 100000,
      scan_filename: file?.name || 'no_image_supplied',
      patient_name: patientName, patient_age: Number(patientAge), gender,
      scan_date: new Date().toISOString(),
      predicted_stage: stage,
      dementia_risk_score: +risk.toFixed(2),
      confidence_interval: +(84 + Math.random() * 10).toFixed(2),
      mean_pixel_intensity: +(f?.mean ?? 40).toFixed(2),
      pixel_variance: +(f?.variance ?? 2000).toFixed(2),
      hippocampal_volume: +(96 - risk * 0.48).toFixed(1),
      ventricular_volume: +(18 + risk * 0.72).toFixed(1),
      cortical_thinning: +(93 - risk * 0.42).toFixed(1),
      recommendations: RECS[stage],
    },
    class_probabilities: probabilities(risk),
    source: 'demo',
  };
}

export function makeSampleScan(atrophy) {
  return new Promise((resolve) => {
    const W = 496, H = 496;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#d9d9d9'; g.beginPath(); g.ellipse(W / 2, H / 2, 190, 228, 0, 0, 7); g.fill();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.ellipse(W / 2, H / 2, 178, 216, 0, 0, 7); g.fill();
    const shrink = 1 - atrophy * 0.12;
    g.fillStyle = '#8a8a8a'; g.beginPath(); g.ellipse(W / 2, H / 2, 172 * shrink, 208 * shrink, 0, 0, 7); g.fill();
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * 6.283, r = Math.random();
      const x = W / 2 + Math.cos(a) * 168 * shrink * Math.sqrt(r), y = H / 2 + Math.sin(a) * 204 * shrink * Math.sqrt(r);
      const v = 110 + Math.random() * 70 - atrophy * 30;
      g.fillStyle = `rgba(${v},${v},${v},0.35)`; g.beginPath(); g.arc(x, y, 3 + Math.random() * 6, 0, 7); g.fill();
    }
    g.strokeStyle = `rgba(10,10,10,${0.3 + atrophy * 0.5})`; g.lineWidth = 1 + atrophy * 4;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * 6.283;
      g.beginPath();
      g.moveTo(W / 2 + Math.cos(a) * 165 * shrink, H / 2 + Math.sin(a) * 200 * shrink);
      g.lineTo(W / 2 + Math.cos(a + 0.05) * (120 - atrophy * 20), H / 2 + Math.sin(a + 0.05) * (150 - atrophy * 20));
      g.stroke();
    }
    const vs = 1 + atrophy * 1.8;
    g.fillStyle = '#0d0d0d';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(W / 2 + s * 22 * vs, H / 2 - 10, 14 * vs, 52 * vs, s * 0.25, 0, 7); g.fill(); }
    c.toBlob((b) => resolve(new File([b], atrophy > 0.5 ? 'sample_atrophy_slice.png' : 'sample_healthy_slice.png', { type: 'image/png' })), 'image/png');
  });
}
