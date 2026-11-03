# PunjabHub AI — Backend API

Modern Express + MongoDB REST API backend for **PunjabHub AI**, featuring hybrid resilience (dual MongoDB & standalone local JSON storage), authentication, Punjab manufacturer directory, administrative controls, and AI marketing generation engines.

---

## 🚀 Quick Start

### 1. Install & Run
From the project root:
```bash
# Start the backend server (runs on port 5000)
npm start

# Or run in auto-reload development mode
npm run dev
```

The API will be live at:
- **Base URL:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

---

## 💾 Dual-Mode Database Architecture

The backend automatically connects to **MongoDB** if available, or gracefully operates in **Local Resilient Storage mode** (`backend/data/punjabhub_store.json`) when offline:

1. **MongoDB Mode (Native):** Connects to any local MongoDB instance or MongoDB Atlas cloud cluster via `MONGO_URI` in `.env`.
2. **Local Resilient Mode:** If MongoDB is offline, the backend starts instantly without crashing, persisting all registrations, logins, listings, and updates to disk.

### To Reset / Re-seed Data:
```bash
npm run seed
```

---

## 🔑 Pre-seeded Accounts & Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@punjabhub.ai` | `AdminPassword123!` | Review listings, manage statuses, view all users |
| **Manufacturer** | `gurpreet@ludhianawoolens.com` | `Password123!` | Manage business listings, AI video studio |

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`, `plan`).
- `POST /api/auth/login` — Sign in with email and password (returns JWT).
- `GET /api/auth/me` — Get profile for currently authenticated user.
- `PUT /api/auth/me` — Update current user profile or subscription plan.
- `GET /api/auth/users` — *(Admin only)* List all registered users.

### Business Directory (`/api/businesses`)
- `GET /api/businesses` — Browse verified listings. Supports `?q=search`, `?city=city`, `?category=cat`.
- `GET /api/businesses/mine` — View listings owned by the logged-in user (or all for admins).
- `GET /api/businesses/:id` — View details of a specific business.
- `POST /api/businesses` — Submit a new business listing.
- `PUT /api/businesses/:id` — Edit an existing business listing (owner or admin).
- `PATCH /api/businesses/:id/status` — *(Admin only)* Approve or reject a listing (`pending`, `approved`, `rejected`).
- `DELETE /api/businesses/:id` — Delete a business listing (owner or admin).

### AI Marketing Studio (`/api/marketing`)
- `POST /api/marketing/video` — Generates complete 4-scene video storyboard, cinematic prompts, audio track recommendation, voiceover script, and hashtags.
- `POST /api/marketing/instagram/publish` — Generates Instagram post package with caption, dimensions, and scheduling metadata.
