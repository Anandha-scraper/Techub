Techub

Techub with admin/master dashboards and a student portal.

Deploy to Vercel
- Set env vars in Vercel: `MONGODB_URI`, `DB_NAME`.
- Build Command: `npm run build`
- Output Directory: `dist/public`
- API is served from `/api` via `api/index.ts`.

Local Development
- `npm install`
- Create `.env` with `MONGODB_URI` and `DB_NAME`.
- `npm run dev`

Notes
- Uses React (Vite) for client and Express + MongoDB on server.
- Master endpoints use `x-master-key` for demo protection.
