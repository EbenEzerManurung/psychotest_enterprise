<div align="center">

# 🧠 Psychotest Enterprise

### Production-Grade Psychometric Assessment Platform with AI-Powered Proctoring

A full-stack, real-time psychometric testing system built with **SvelteKit**, **Svelte 5.56.1 (Runes)**, and **Tailwind CSS v4** — featuring role-based workflows, live camera proctoring, integrity scoring, and multi-format reporting.

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

**[Overview](#-overview)** • **[Features](#-key-features)** • **[Tech Stack](#-technology-stack)** • **[Architecture](#-architecture)** • **[Proctoring](#-ai-powered-proctoring)** • **[Project Structure](#-project-structure)** • **[Getting Started](#-getting-started)** • **[Author](#-author)**

</div>

---

## 📖 Overview

**Psychotest Enterprise** is a production-grade psychometric assessment platform designed for HR teams to conduct intelligent, secure, and automated candidate screening at scale.

Built with a **SvelteKit (Node adapter)** backend and a **Svelte 5 Runes + Tailwind CSS v4** frontend, Psychotest Enterprise delivers an end-to-end hiring assessment solution — from candidate registration and test assignment, to real-time camera proctoring, integrity scoring, and analytical dashboards with Excel exports.

The system demonstrates a real-world, enterprise-style implementation of:

- 🎥 **AI-Powered Proctoring** — camera enforcement, face presence detection, behavioral monitoring
- 🛡️ **Integrity Scoring** — dynamic 0–100 score with severity-weighted penalties
- 🔐 **Role-Based Access Control (RBAC)** — 3 distinct permission levels with route guards
- 🧠 **Dual Assessment Engine** — Intelligence test (timed) + Personality test (untimed)
- ⚡ **Real-Time Timer System** — per-session countdown with auto-submit & warning thresholds
- 📊 **Visual Analytics** — Radar charts, progress bars, aggregated statistics
- 📑 **Excel Reporting** — styled `.xlsx` exports with integrity data
- 📱 **Progressive Web App** — installable, offline-capable, custom icons
- 🏗️ **Clean Layered Architecture** — Routes → Guards → Server → Database
- 🔒 **JWT-Secured Sessions** with bcrypt password hashing
- ✨ **Enterprise UX** — flash alerts, custom modals, keyboard shortcuts, responsive design

> 💡 Psychotest Enterprise reflects how modern HR teams conduct psychometric assessments — combining fair evaluation, integrity enforcement, and data-driven decision-making in a single cohesive platform.

---

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

### 🎥 AI-Powered Proctoring
- **Mandatory camera** — candidates cannot start without granting access
- **Fullscreen enforcement** — auto re-enter on exit, penalize violations
- **Tab-switch detection** — blur events logged with severity
- **Copy-paste blocking** — Ctrl+C, Ctrl+V, right-click disabled
- **DevTools detection** — F12, Ctrl+Shift+I/J/C, Ctrl+U/P/S blocked
- **Face presence monitoring** — periodic face detection via MediaPipe
- **Multi-face detection** — flags when more than one face is visible
- **Periodic snapshots** — camera captures saved for HR review
- **Auto-terminate** — session cancelled after 5 critical violations

### 🛡️ Integrity Scoring System
- Dynamic score from **0 to 100** with severity-weighted penalties
- 4-tier classification:
  - **90–100** → ✅ *Sangat Jujur* (Highly Trustworthy)
  - **75–89** → ✅ *Jujur* (Trustworthy)
  - **60–74** → ⚠️ *Mencurigakan* (Suspicious)
  - **< 60** → ❌ *Indikasi Curang* (Fraud Indication)
- Full **violation timeline** with timestamps and score deltas
- **Camera status indicator** — confirms if camera was active throughout
- Snapshot count displayed to HR

### 🧠 Dual Assessment Engine
- **Intelligence Test** — 60 questions across 6 sub-categories:
  - Logic & Reasoning (10)
  - Numeric Patterns (10)
  - Figural Patterns (10)
  - Verbal (Synonym/Antonym) (10)
  - Word Analogy (10)
  - Arithmetic (10)
- **Personality Test** — 90 questions (Ipsative format):
  - Integritas (Integrity) — 15
  - Teamwork — 15
  - Kreativitas (Creativity) — 15
  - Manajemen Konflik (Conflict Mgmt) — 15
  - Pendirian (Conviction) — 15
  - Interpersonal — 15

</td>
<td width="50%" valign="top">

### ⏱️ Real-Time Timer System
- **Intelligence test** — 40-minute total countdown
- **Personality test** — untimed (unlimited, self-paced)
- Warning threshold at 5 min (amber) and 1 min (red pulsing)
- **Auto-submit** on timeout with confirmation toast
- Server-side remaining time sync on page reload

### 🧭 Dynamic Navigation
- **Collapsible question grid** — jump to any question instantly
- **Color-coded status** — active / answered / unanswered
- **Skip functionality** — pass questions and return later
- **Progress tracking** — live answered/unanswered counter
- **Prevent accidental submit** — 600ms guard after grid close

### 📊 HR Dashboard & Analytics
- **Real-time statistics** — total candidates, users, questions, completed tests
- **Average scores** — intelligence & personality profile
- **Radar chart** — visual personality dimension comparison
- **Recent activity log** — last 8 test sessions
- **Status distribution** — registered, testing, completed, hired, rejected

### 📑 Reports & Excel Export
- **Comprehensive summary** — all candidates in a single view
- **Filter-aware export** — respects search + status filter
- **Styled `.xlsx`** — green header, auto column widths, zebra striping
- **Integrity column** — HR sees fraud indicators at a glance
- **Personality breakdown** — 6 dimensions per candidate

### 👥 User & Role Management
- **Secure JWT authentication** with httpOnly cookies
- **3-role RBAC**:
  - **Superadmin** — full access + user management
  - **HR** — candidates, questions, tests, results, exports
  - **Candidate** — take assigned tests, view own results
- **Full CRUD** for users with role assignment
- **Self-protection** — cannot delete superadmin
- **Activity tracking** — last login timestamps

### 🎨 Enterprise UX
- **Flash alerts** — login, logout, error notifications
- **Custom modals** — never trigger browser blur
- **Responsive** — Desktop / Tablet / Mobile
- **Calm green theme** — comfortable for long test sessions
- **PWA support** — installable with custom icons

</td>
</tr>
</table>

---

## 👥 Roles & Permissions

| Role | Level | Dashboard | Users | Candidates | Questions | Tests | Results | Export |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Superadmin** | 3 | ✅ Full | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ Assign | ✅ View | ✅ |
| **HR** | 2 | ✅ Full | ❌ | ✅ CRUD | ✅ CRUD | ✅ Assign | ✅ View | ✅ |
| **Candidate** | 1 | 👁 Own | ❌ | ❌ | ❌ | ✅ Take | 👁 Own | ❌ |

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | SvelteKit 2.8 |
| UI Framework | Svelte 5.57 (Runes: `$state`, `$derived`, `$props`, `$effect`) |
| Language | TypeScript 5.9 |
| Build Tool | Vite 8.0 |
| Styling | Tailwind CSS v4.3.3 (CSS-first config) |
| Runtime | Node.js 20+ |
| Adapter | `@sveltejs/adapter-node` |
| Backend Language | TypeScript (Node runtime) |
| Database | MySQL 8.4 |
| DB Driver | `mysql2/promise` (connection pool) |
| Authentication | JWT (`jsonwebtoken`) + bcrypt |
| Excel Generation | `exceljs` |
| Charts | Chart.js (radar) |
| Face Detection | MediaPipe Face Detection |
| PWA | `@vite-pwa/sveltekit` |
| Migration System | Custom TS runner (`tsx`) |
| API Style | SvelteKit Form Actions + REST endpoints |
| Architecture | Clean Layered (Routes → Guards → Server → DB) |

---

## 🏗 Architecture

Psychotest Enterprise follows a clean layered architecture with strict separation of concerns. Every protected route passes through authentication hooks and RBAC guards, ensuring zero unauthorized access.


┌──────────────────────────────────────┐
│      Client (Browser / PWA)          │
│  SvelteKit + Svelte 5 Runes + TW4    │
└───────────────┬──────────────────────┘
                │  Form Actions + REST
                │  (JSON over HTTP)
┌───────────────▼──────────────────────┐
│         Node.js Runtime               │
│       (SvelteKit + Adapter)           │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │      hooks.server.ts              │ │
│  │   • JWT Verify  • Flash Read      │ │
│  └────────────┬─────────────────────┘ │
│               │                        │
│  ┌────────────▼─────────────────────┐ │
│  │      Route Guards                 │ │
│  │   • requireAuth  • requirePerm    │ │
│  └────────────┬─────────────────────┘ │
│               │                        │
│  ┌────────────▼─────────────────────┐ │
│  │    +page.server.ts (Loaders)     │ │
│  │   • SQL queries  • Validation     │ │
│  └────────────┬─────────────────────┘ │
│               │                        │
│  ┌────────────▼─────────────────────┐ │
│  │    Server Library                 │ │
│  │  • db.ts  • auth.ts  • rbac.ts    │ │
│  │  • guard.ts  • scoring.ts         │ │
│  └────────────┬─────────────────────┘ │
└───────────────┼────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│              MySQL 8.4                 │
│  (17 tables with FK constraints +     │
│   proctoring logs + snapshots)         │
└────────────────────────────────────────┘
