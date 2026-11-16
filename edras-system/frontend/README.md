# EDRAS Frontend

React 19 + Vite + Tailwind 4, original EDRAS MedTech design. The Flask backend is unchanged.

## Deploy to Netlify
1. `npm install && npm run build`
2. Drag the `dist` folder onto https://app.netlify.com/drop (or import the repo; `netlify.toml` is set up).

With no backend the site runs in **Demo** mode for everyone. To connect the real model, put your
backend URL in `dist/config.js` (or set `VITE_API_BASE_URL` in Netlify) — see `DEPLOY.md` in the repo root.

## Local development
```
npm install
npm run dev     # uses http://localhost:5000 if the backend is running
```
