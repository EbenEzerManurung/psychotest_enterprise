<div align="center">

<img width="90" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9d1-200d-1f4bb.png" alt="person working on laptop" />

# Psychotest Enterprise

### AI-Proctored Psychometric Assessment Platform for Modern Hiring

*A production-grade, full-stack testing system with real-time integrity monitoring, adaptive scoring, and enterprise reporting — built for HR teams who need to screen candidates fairly, securely, and at scale.*

<br/>

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.8-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-5.57-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Secure-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active--development-brightgreen?style=for-the-badge)

**[Overview](#overview)** · **[Features](#key-features)** · **[Architecture](#architecture)** · **[Proctoring Engine](#ai-powered-proctoring)** · **[Tech Stack](#technology-stack)** · **[Getting Started](#getting-started)** · **[Screenshots](#screenshots)** · **[Author](#author)**

</div>

---

## 📖 Overview


**Psychotest Enterprise** is an end-to-end psychometric assessment platform that helps HR teams run intelligent, secure, and tamper-resistant candidate screening — from registration and test assignment to live camera proctoring, integrity scoring, and analytics-driven reporting.

Built on a **SvelteKit + Node.js** backend and a **Svelte 5 (Runes) + Tailwind CSS v4** frontend, the platform demonstrates a real-world, enterprise-style implementation of:

| | |
|---|---|
| 🎥 | **AI-Powered Proctoring** — camera enforcement, face presence detection, behavioral monitoring |
| 🛡️ | **Integrity Scoring** — dynamic 0–100 score with severity-weighted penalties |
| 🔐 | **Role-Based Access Control** — three permission tiers with server-side route guards |
| 🧠 | **Dual Assessment Engine** — timed Intelligence test + untimed Personality inventory |
| ⚡ | **Real-Time Timer System** — countdown sessions with auto-submit and warning thresholds |
| 📊 | **Visual Analytics** — radar charts, progress tracking, aggregated statistics |
| 📑 | **Excel Reporting** — styled `.xlsx` exports with full integrity data |
| 📱 | **Progressive Web App** — installable, offline-capable |

> Psychotest Enterprise reflects how modern HR teams actually run psychometric assessments — combining fair evaluation, integrity enforcement, and data-driven decisions in one cohesive platform.

---

## ✨ Key Features

### 🎥 AI-Powered Proctoring
- Mandatory camera access before a session can start
- Fullscreen enforcement with automatic re-entry on exit
- Tab-switch detection via blur events, logged with severity
- Copy/paste and right-click blocking
- DevTools shortcut detection (F12, Ctrl+Shift+I/J/C, Ctrl+U/P/S)
- Periodic face presence monitoring via MediaPipe
- Multi-face detection flagging
- Scheduled camera snapshots for HR review
- Auto-termination after 5 critical violations

### 🛡️ Integrity Scoring
Dynamic score from **0–100**, derived from severity-weighted penalties, with a four-tier classification:

| Score | Classification |
|:---:|---|
| 90–100 | ✅ Highly Trustworthy |
| 75–89 | ✅ Trustworthy |
| 60–74 | ⚠️ Suspicious |
| < 60 | ❌ Fraud Indication |

Includes a full violation timeline with timestamps and score deltas, camera-uptime confirmation, and snapshot counts for HR audit.

### 🧠 Dual Assessment Engine
**Intelligence Test** — 60 questions across 6 categories (Logic & Reasoning, Numeric Patterns, Figural Patterns, Verbal, Word Analogy, Arithmetic — 10 each)

**Personality Test** — 90 ipsative-format questions across 6 dimensions (Integrity, Teamwork, Creativity, Conflict Management, Conviction, Interpersonal — 15 each)

### ⏱️ Real-Time Timer System
- 40-minute countdown for the Intelligence test; Personality test is self-paced
- Amber warning at 5 minutes remaining, pulsing red alert at 1 minute
- Auto-submit on timeout with confirmation toast
- Server-side remaining-time sync on page reload

### 🧭 Dynamic Navigation
- Collapsible question grid with instant jump-to-question
- Color-coded status (active / answered / unanswered)
- Skip-and-return functionality with live progress counter

### 📊 HR Dashboard & Analytics
- Real-time statistics on candidates, users, questions, and completed sessions
- Average intelligence & personality scores with radar-chart visualization
- Recent activity log and candidate status distribution

### 📑 Reports & Excel Export
- Filter-aware, styled `.xlsx` exports (headers, zebra striping, auto column widths)
- Integrity indicators and full 6-dimension personality breakdown per candidate

### 👥 User & Role Management
- JWT authentication with httpOnly cookies and bcrypt password hashing
- Three-tier RBAC: **Superadmin**, **HR**, **Candidate**
- Full user CRUD with self-protection against deleting the superadmin account

---

## 👑 Roles & Permissions

| Role | Level | Dashboard | Users | Candidates | Questions | Tests | Results | Export |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Superadmin** | 3 | Full | CRUD | CRUD | CRUD | Assign | View | ✅ |
| **HR** | 2 | Full | — | CRUD | CRUD | Assign | View | ✅ |
| **Candidate** | 1 | Own only | — | — | — | Take | Own only | — |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | SvelteKit 2.8 |
| UI Framework | Svelte 5.57 (Runes: `$state`, `$derived`, `$props`, `$effect`) |
| Language | TypeScript 5.9 |
| Build Tool | Vite 8.0 |
| Styling | Tailwind CSS v4.3.3 (CSS-first config) |
| Runtime | Node.js 20+ |
| Adapter | `@sveltejs/adapter-node` |
| Database | MySQL 8.4 |
| DB Driver | `mysql2/promise` (connection pool) |
| Authentication | JWT (`jsonwebtoken`) + bcrypt |
| Excel Generation | `exceljs` |
| Charts | Chart.js (radar) |
| Face Detection | MediaPipe Face Detection |
| PWA | `@vite-pwa/sveltekit` |
| Migrations | Custom TypeScript runner (`tsx`) |
| API Style | SvelteKit Form Actions + REST endpoints |
| Architecture | Clean layered: Routes → Guards → Server → Database |

---

## 🏗️ Architecture

Psychotest Enterprise follows a clean, layered architecture with strict separation of concerns. Every protected route passes through authentication hooks and RBAC guards before it ever touches the database.

```
┌──────────────────────────────────────┐
│         Client (Browser / PWA)        │
│    SvelteKit + Svelte 5 Runes + TW4   │
└───────────────────┬──────────────────┘
                     │  Form Actions + REST (JSON over HTTP)
┌────────────────────▼──────────────────┐
│              Node.js Runtime            │
│           SvelteKit + Adapter           │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  hooks.server.ts                    │ │
│  │  JWT verification · Flash messages  │ │
│  └───────────────┬────────────────────┘ │
│  ┌───────────────▼────────────────────┐ │
│  │  Route Guards                       │ │
│  │  requireAuth · requirePermission    │ │
│  └───────────────┬────────────────────┘ │
│  ┌───────────────▼────────────────────┐ │
│  │  +page.server.ts (Loaders)          │ │
│  │  SQL queries · Validation           │ │
│  └───────────────┬────────────────────┘ │
│  ┌───────────────▼────────────────────┐ │
│  │  Server Library                     │ │
│  │  db · auth · rbac · guard · scoring │ │
│  └───────────────┬────────────────────┘ │
└──────────────────┬───────────────────────┘
                    │
┌───────────────────▼───────────────────┐
│                MySQL 8.4                │
│  17 tables · FK constraints ·           │
│  proctoring logs · snapshots            │
└──────────────────────────────────────────┘
```

---

## 🎥 AI-Powered Proctoring

The proctoring engine enforces integrity through independent, layered checks:

```
┌─────────────────────────────────────────────────────┐
│ PRE-FLIGHT CHECK                                     │
│ · Camera permission required (getUserMedia)          │
│ · Fullscreen lock enforced                           │
│ · Face presence verified via MediaPipe                │
│ · Right-click, copy, and DevTools shortcuts blocked   │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│ DURING TEST — Real-Time Monitoring                   │
│ Tab-switch detected (blur event)          −5 pts     │
│ Fullscreen exit                           −10 pts    │
│ Right-click attempt                       −3 pts     │
│ Copy / paste attempt                      −10 pts    │
│ DevTools detected                         −30 pts    │
│ Multiple faces detected                   −20 pts    │
│ No face detected > 5 seconds              −8 pts     │
│ Looking away too long                     −5 pts     │
│ Periodic camera snapshots saved for HR review         │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│ POST-TEST — Integrity Score                          │
│ · Score = 100 − Σ(penalties)                         │
│ · Classified: Trustworthy / Suspicious / Fraud        │
│ · Violation timeline + snapshots stored               │
│ · Full audit trail surfaced on the HR dashboard       │
└─────────────────────────────────────────────────────┘
```

**Answer flow:** candidate selects an answer → auto-saved via `POST /api/test/answer` → `INSERT ... ON DUPLICATE KEY UPDATE` → local state and progress bars re-render → on submit, scores are calculated and integrity/violation data is persisted.

---

## 📁 Project Structure

```
psychotest-app/
├── scripts/
│   ├── config.ts                 # DB config
│   ├── migrate.ts                # Migration runner (--fresh --seed)
│   ├── migrations/                # 001–008 sequential SQL migrations
│   └── seeders/                   # Roles, users, categories, questions
│
├── src/
│   ├── app.css                   # Tailwind v4 theme
│   ├── hooks.server.ts           # JWT verify + flash messages
│   │
│   ├── lib/
│   │   ├── rbac.ts               # Permissions & menu config
│   │   ├── proctor.ts            # Proctoring rules & helpers
│   │   ├── scoring-labels.ts     # Score → label converter
│   │   ├── server/
│   │   │   ├── db.ts             # MySQL pool
│   │   │   ├── auth.ts           # bcrypt + JWT
│   │   │   ├── guard.ts          # requireAuth / requirePermission
│   │   │   ├── flash.ts          # Flash cookie helpers
│   │   │   └── scoring.ts        # Intelligence & personality scoring
│   │   └── components/
│   │       ├── ui/               # Button, Input, Modal, TestTimer...
│   │       ├── layout/           # Sidebar, Header
│   │       └── charts/           # RadarChart
│   │
│   └── routes/
│       ├── login/
│       ├── dashboard/
│       ├── users/
│       ├── candidates/
│       ├── questions/{intelligence,personality}/
│       ├── results/
│       ├── reports/
│       ├── test/take/
│       └── api/
│           ├── auth/logout/
│           ├── export/
│           ├── test/{answer,submit}/
│           └── proctor/{log,snapshot,camera-on}/
│
├── static/                       # PWA manifest, icons, favicon
├── .env
├── package.json
└── svelte.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** and npm 10+ — [Download](https://nodejs.org/)
- **MySQL 8.0+** (or XAMPP / Laragon) — [Download](https://www.mysql.com/)
- **Git**
- A modern browser with camera access (Chrome or Edge recommended)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/psychotest-enterprise.git
cd psychotest-enterprise

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=psychotest_db
JWT_SECRET=your-256-bit-secret-min-32-chars
JWT_EXPIRES_IN=8h
```

```bash
# 4. Set up the database and seed demo data
npm run migrate:fresh-seed

# 5. Start the development server
npm run dev
```

The application will be available at **http://localhost:5173**.

**Demo accounts (seeded):**

| Username | Password | Role |
|---|---|---|
| `superadmin` | `password123` | Superadmin |
| `hr` | `password123` | HR Manager |
| `candidate1` | `candidate123` | Candidate |

### NPM Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Vite HMR) |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check with `svelte-check` |
| `npm run migrate` | Run pending migrations only |
| `npm run migrate:fresh` | Drop all tables and re-run migrations |
| `npm run migrate:fresh-seed` | Full reset + seed ⭐ |
| `npm run migrate:rollback` | Roll back the last migration batch |
| `npm run seed` | Run seeders only |

### Production Deployment

```bash
# 1. Build
npm run build

# 2. Set production environment variables
export NODE_ENV=production
export DATABASE_HOST=your-db-host
export JWT_SECRET=your-secret

# 3. Run
node build/index.js
```

The app runs on port `3000` by default (configurable via the `PORT` environment variable).

---

## 🎨 Design System

Psychotest Enterprise uses a calm green palette designed for long test sessions — reducing eye strain and supporting focus during cognitive assessments.

| Token | Value | Purpose |
|---|---|---|
| Primary 700 | `#15803d` | Buttons, active states |
| Primary 500 | `#22c55e` | Success states, accents |
| Primary 100 | `#dcfce7` | Backgrounds, badges |
| Primary 50 | `#f0fdf4` | Page background |
| Danger | `#dc2626` | Errors, critical warnings |
| Warning | `#f59e0b` | Alerts, pending states |
| Text | `#1e293b` | Body text |

**Why green?** Green is associated with calmness, balance, and focus — well suited to high-stakes cognitive testing. The palette avoids clinical blues and alarm-inducing reds, keeping candidates in a stable, focused state throughout the session.

---

## 🔒 Security Highlights

- **JWT sessions** — stateless, 8-hour expiry, httpOnly cookies
- **bcrypt** password hashing (cost factor 12)
- **Role-based guards** on every route, evaluated before data loads
- **Parameterized queries** throughout (`mysql2` placeholders — no string concatenation)
- **Same-origin CORS** by default
- **Server-side input validation** on every action
- **Unique constraints** on username, email, NIK, and access tokens
- **Idempotent writes** — duplicate answer submissions overwrite safely
- **Proctoring cannot be bypassed via DevTools**
- **Auto-termination** after violation thresholds are exceeded

---

## 📸 Screenshots

<table>
<tr>
<td width="50%">

**Login — Enterprise Theme**
<img width="1909" height="988" alt="image" src="https://github.com/user-attachments/assets/93133a5e-ba50-4b6c-b1a7-4c1071c74a85" />


**HR Dashboard**
<img width="1917" height="997" alt="image" src="https://github.com/user-attachments/assets/15ca934f-1e55-4b16-a461-86fb4b3cb772" />

**Manage Users**
<img width="1917" height="997" alt="image" src="https://github.com/user-attachments/assets/15ca934f-1e55-4b16-a461-86fb4b3cb772" />
<img width="1903" height="997" alt="image" src="https://github.com/user-attachments/assets/ca0ebcec-cb73-462c-9a6d-3ea70efefaa0" />

**Calon Karyawan (candidate employee)**
<img width="1914" height="999" alt="image" src="https://github.com/user-attachments/assets/b24c4d1b-6753-4592-8258-52e7e9a20d12" />

<img width="1903" height="949" alt="image" src="https://github.com/user-attachments/assets/42162e94-012a-458f-a058-ad83a6574bf7" />

<img width="1891" height="985" alt="image" src="https://github.com/user-attachments/assets/81e78597-3aa5-41e9-9cc4-f172a9480b58" />

**Test**
<img width="1918" height="957" alt="image" src="https://github.com/user-attachments/assets/980e7bb2-63a4-4693-842a-b375077f0ee9" />
<img width="1915" height="928" alt="image" src="https://github.com/user-attachments/assets/bb972a19-312e-4183-a9a0-0629b6e94371" />

<img width="1912" height="943" alt="image" src="https://github.com/user-attachments/assets/3e42acbb-917c-4c40-9ce0-f5f196cdf5c0" />

<img width="1917" height="949" alt="image" src="https://github.com/user-attachments/assets/b127a2b1-6bee-4618-8a29-e824930f4aca" />

**Result Test**
<img width="1867" height="1006" alt="image" src="https://github.com/user-attachments/assets/2eaa522f-c468-4e0f-afc8-2a2180832830" />

**Report Test**
<img width="1918" height="1002" alt="image" src="https://github.com/user-attachments/assets/d244835d-482b-4c0f-92c2-bbb98042a6dd" />




---

## 🎯 Roadmap

**Shipped**
- [x] Role-based access control (3 roles)
- [x] Dual assessment engine (Intelligence + Personality)
- [x] AI-powered proctoring with camera enforcement
- [x] Integrity scoring with violation timeline
- [x] Real-time timer with auto-submit
- [x] Question grid navigation with skip functionality
- [x] Blur-safe custom modals
- [x] Flash alerts for login / logout / errors
- [x] Excel export with integrity data
- [x] Radar chart for personality visualization
- [x] Progressive Web App with custom icons
- [x] Migration & seeder system (`migrate:fresh-seed`)

**Planned**
- [ ] 68-point face landmark detection (MediaPipe)
- [ ] Screen recording (`getDisplayMedia`)
- [ ] Multi-branch assessment support
- [ ] Email notifications on test assignment
- [ ] Per-candidate PDF report export
- [ ] AI behavior analysis (eye tracking, head pose)
- [ ] Docker Compose deployment
- [ ] Dark mode
- [ ] i18n (Bahasa Indonesia / English)

---

## 🧭 Design Philosophy

**Why Runes?** Svelte 5's Runes (`$state`, `$derived`, `$props`, `$effect`) provide explicit reactivity that scales cleanly across complex state machines — test timers, proctoring events, multi-step navigation — without the implicit magic of legacy reactivity.

**Why custom modals?** Native `confirm()` and `alert()` trigger browser blur events, which the proctoring system correctly interprets as "candidate left the page." Custom Svelte modals eliminate these false positives while preserving the confirmation UX.

**Why an integrity score?** Traditional psychometric assessments are vulnerable to impersonation, AI assistance, and off-screen lookup. The integrity score quantifies that risk, giving HR teams a data-driven signal alongside traditional personality and intelligence metrics.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 👨‍💻 Author

**Eben Nezer Manurung**
Full Stack Developer • Backend Engineer

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EbenEzerManurung)

⭐ *If this project helped you, please consider giving it a star.*

<sub>Built with SvelteKit, Svelte 5 Runes, Tailwind CSS v4.3.3, and MySQL 8.4</sub>

</div>
