Techub

Full‑stack app with Admin/Master dashboards and a Student portal. Client is React (Vite + Tailwind); API is Express + MongoDB (Mongoose). Single Node service serves both UI and API.

Features
- Admin: manage students, points add/minus, attendance (mark, summary, export PDF), feedback.
- Master: approve admins, update admin creds, cascade delete, basic stats.
- Student: view points history, submit feedback, view attendance.
- Auth: simple role-based login (admin/master/student) with hashed passwords.
- Excel/CSV upload: bulk create/update students with generated credentials.
- Loader UX: global loader component shows during page fetches and Excel upload.

Getting started
1) Install
   - `npm ci` (or `npm install`)
2) Env vars: create `.env` in repo root with at least:
   - `MONGODB_URI=your-mongodb-connection-string`
   - `DB_NAME=techub` (optional; defaults to techub)
3) Development
   - `npm run dev`
   - Opens server on http://localhost:10000 and Vite dev in the same service. Health check: http://localhost:10000/api/health
4) Build (production)
   - `npm run build` → outputs to `dist/public`
5) Start (production)
   - `npm start` → serves API and built client on PORT (defaults 10000)

Deployment (Render)
- This repo includes `render.yaml` and `Procfile` preconfigured.
- In Render: New → Web Service → connect repo. It will auto-detect settings.
  - Build command: `npm ci && npm run build`
  - Start command: `npm start`
  - Node: 20
  - Environment variables: set `MONGODB_URI`; optionally `DB_NAME`.
  - Health check path: `/api/health`

API overview
- Auth: `POST /api/auth/login`, `POST /api/auth/change-password`
- Students: `GET/POST /api/students`, `GET /api/students/:id`, `PUT /api/students/:id/points`, add/minus endpoints
- Feedback: `GET/POST /api/feedback`, status/read, delete
- Attendance: `GET/POST /api/attendance`, summary/export, delete by date
- Master: admins list, approve, update user, cascade delete, stats

Loader component
- File: `client/src/components/Loader.tsx`
- Used in Admin, Student, Master pages during data loads.
- Also shown during Excel upload confirmation in `client/src/components/ExcelUpload.tsx`.

Notes
- Master endpoints are protected via `x-master-key: master` for demo. Replace with proper auth (JWT) in production.
- We removed dev seeding/debug scripts from repo; they are not required for deployment.
