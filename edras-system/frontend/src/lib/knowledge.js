// Offline copy of the assistant's knowledge map, used when the Flask backend
// is not reachable (e.g. the Netlify demo). Mirrors /api/assessments/ai-chatbot topics.
const TOPICS = [
  {
    words: ['mri', 'scan', 'volume', 'imaging', 'biomarker', 'hippocamp', 'ventric', 'cortex', 'cortical'],
    reply:
      'Structural brain MRI shows three key signs of cognitive decline. Hippocampal volume: the memory hub, usually the first area to shrink. Ventricular enlargement: the fluid spaces widen as surrounding tissue is lost. Cortical thinning: loss of neurons across the temporal and parietal lobes. EDRAS combines these into one Dementia Risk Index from 0 to 100.',
  },
  {
    words: ['stage', 'mild', 'moderate', 'severe', 'classification', 'non demented', 'cdr'],
    reply:
      'EDRAS uses four stages. No dementia (CDR 0): typical memory and tissue volume for age. Very mild (CDR 0.5): small memory lapses, still fully independent. Mild (CDR 1): trouble with complex tasks like finances or finding the way. Moderate (CDR 2): clear short-term memory loss, needs daily support.',
  },
  {
    words: ['symptom', 'sign', 'early', 'warning', 'forget', 'memory', 'confus'],
    reply:
      'Early warning signs: forgetting recent conversations, trouble planning or solving everyday problems, confusion about time or familiar places, struggling to find words, putting things in unusual places, and mood changes or withdrawal. If you notice these, book an MMSE/MoCA screening — and try the Brain Gym tests here for a quick baseline.',
  },
  {
    words: ['score', 'mmse', 'moca', 'test', 'cognitive'],
    reply:
      'MMSE (0–30): 24 or more is usually normal, 19–23 suggests mild impairment, 18 or less suggests moderate-to-severe decline. MoCA (0–30): more sensitive to early change; 26 or more is considered normal. Both should be interpreted by a clinician alongside education level.',
  },
  {
    words: ['exercise', 'diet', 'prevent', 'lifestyle', 'food', 'nutrition', 'sleep', 'walk'],
    reply:
      'Four habits with the best evidence: 150+ minutes of aerobic activity a week, a MIND/Mediterranean-style diet (leafy greens, berries, olive oil, fish), 7–8 hours of good sleep, and staying socially and mentally active. The Risk factors page shows the 14 modifiable factors from the 2024 Lancet Commission.',
  },
  {
    words: ['gene', 'genetic', 'apoe', 'heredit', 'inherit', 'family'],
    reply:
      'APOE ε4 is the main genetic risk gene for late-onset Alzheimer\'s. One copy raises risk roughly 3-fold, two copies roughly 8–12-fold — but it is a susceptibility gene, not a certainty. Many carriers never develop dementia, and lifestyle changes still lower risk.',
  },
  {
    words: ['medicine', 'medication', 'drug', 'treatment', 'cure', 'donepezil', 'lecanemab'],
    reply:
      'Treatments fall into two groups. Symptomatic: cholinesterase inhibitors (donepezil, rivastigmine, galantamine) and memantine. Disease-modifying: anti-amyloid antibodies such as lecanemab and donanemab, for selected early-stage patients. A neurologist decides eligibility.',
  },
  {
    words: ['model', 'accuracy', 'algorithm', 'how it works', 'ai', 'ensemble'],
    reply:
      'The EDRAS engine is a soft-voting ensemble of Random Forest and Gradient Boosting models. It extracts 17 statistical and anatomical features from each MRI slice — intensity distribution, asymmetry, ventricle-to-tissue ratio — and predicts one of four stages with a continuous risk index.',
  },
  {
    words: ['telehealth', 'doctor', 'call', 'appointment', 'consult', 'video'],
    reply:
      'Open the Telehealth tab to start a video consultation. Your clinician can see your latest scan summary during the call and add notes to your record.',
  },
];

export function localReply(message) {
  const m = (message || '').toLowerCase();
  const hit = TOPICS.find((t) => t.words.some((w) => m.includes(w)));
  return (
    hit?.reply ||
    'I can explain MRI results, the four dementia stages, MMSE and MoCA scores, warning signs, prevention habits, genetics and treatments. What would you like to know?'
  );
}
