# Deploying EDRAS (free)

Frontend → **Netlify** (free, always on).  Backend → **Render** (free, sleeps after 15 min idle, ~1 min to wake).

## 1. Put the code on GitHub
Push this whole folder to a GitHub repo (Render needs it).

## 2. Backend on Render
1. Sign up at https://render.com with GitHub.
2. **New → Blueprint** → select your repo → **Apply**. (`render.yaml` sets everything: Docker, free plan, secret keys.)
3. Wait for the build (~5 min). Copy the URL, e.g. `https://edras-backend.onrender.com`.
4. Open that URL — you should see `"EDRAS Backend API is running successfully!"`.

## 3. Frontend on Netlify
**Option A — drag & drop**
1. Unzip `EDRAS-netlify-dist.zip`.
2. Open `config.js` inside it, paste the Render URL between the quotes, save.
3. Sign in at https://app.netlify.com → **Add new site → Deploy manually** → drag the unzipped folder (the one with `index.html`).

**Option B — from GitHub (auto-redeploys)**
1. Netlify → **Add new site → Import from Git** → pick the repo. `netlify.toml` fills in the build settings.
2. **Site configuration → Environment variables** → add `VITE_API_BASE_URL` = your Render URL → redeploy.

Leave the URL empty and the site runs in demo mode (no backend needed).

## Notes
- Free Render storage is wiped on every restart/sleep, so the SQLite database and uploads reset. Fine for demos. For permanent data, add a Render Postgres DB and set `DATABASE_URL`.
- The free image swaps PyTorch for a tiny stand-in (`edras-system/deploy/torch_lite`), because the repo has no trained weights for the PyTorch voice/text network and real PyTorch would exceed 512 MB RAM. The trained MRI model runs fully. On a 1 GB+ plan, follow the comment in `edras-system/deploy/Dockerfile` to use real PyTorch.
