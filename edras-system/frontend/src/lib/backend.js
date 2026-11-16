// Shared backend client: auth header, live/demo detection, and error helpers.
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_BASE_URL, BACKEND_CONFIGURED } from '../config/api';

export const http = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
http.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('edras_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// True when the server never answered (offline / not deployed) — the only case
// where falling back to demo data is correct. A 401/409/500 must be shown to the user.
export const isNetworkError = (err) => !err?.response;
export const serverMessage = (err, fallback) => err?.response?.data?.error || err?.response?.data?.message || fallback;

let mode = BACKEND_CONFIGURED ? 'checking' : 'demo';
const listeners = new Set();
const setMode = (m) => { mode = m; listeners.forEach((fn) => fn(m)); };
export const getMode = () => mode;
export const markOffline = () => { if (mode !== 'demo') setMode('demo'); };

// Free hosts (Render) sleep when idle and need ~1 min to wake: keep retrying for 2 min.
let detecting = false;
export async function detectBackend() {
  if (!BACKEND_CONFIGURED) return setMode('demo');
  if (detecting || mode === 'live') return;
  detecting = true;
  const start = Date.now();
  while (Date.now() - start < 120000) {
    try {
      await http.get('/api/assessments/dashboard-stats', { timeout: 8000 });
      setMode('live'); detecting = false; return;
    } catch {
      if (mode !== 'waking') setMode('waking');
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  detecting = false;
  setMode('demo');
}

export function useBackendMode() {
  const [m, setM] = useState(mode);
  useEffect(() => { listeners.add(setM); setM(mode); return () => listeners.delete(setM); }, []);
  return m;
}
