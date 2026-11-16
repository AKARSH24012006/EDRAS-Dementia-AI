/**
 * Centralized API configuration for EDRAS Frontend.
 * Priority: window.EDRAS_API_BASE_URL (public/config.js, editable after build)
 *        → VITE_API_BASE_URL (build time) → http://localhost:5000 (local dev).
 */
const runtimeUrl = typeof window !== 'undefined' && window.EDRAS_API_BASE_URL;
export const API_BASE_URL = (runtimeUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

// A deployed site can't reach a backend on the visitor's own localhost.
const LOCAL = /localhost|127\.0\.0\.1/;
const pageIsLocal = typeof window !== 'undefined' && LOCAL.test(window.location.hostname);
export const BACKEND_CONFIGURED = !(LOCAL.test(API_BASE_URL) && !pageIsLocal);
