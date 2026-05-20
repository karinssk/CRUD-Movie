# Movie Manager

A full-stack Movie CRUD application.

**Stack:** React 18 + Vite + TypeScript · MobX State Tree · Express + TypeScript · SQLite · Docker · Nginx

---

## Running with Docker (recommended)

```bash
docker compose up --build
```

Open http://localhost

---

## Running locally (development)

**Backend**
```bash
cd backend
cp .env.example .env          # set JWT_SECRET
npm install
npm run seed                  # creates DB + demo users
npm run dev                   # http://localhost:3001
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173  (proxies /api → :3001)
```

---

## Demo accounts

| Username  | Password     | Role        | Can Delete? |
|-----------|-------------|-------------|-------------|
| manager1  | manager123  | MANAGER     | Yes         |
| leader1   | leader123   | TEAMLEADER  | No          |
| staff1    | staff123    | FLOORSTAFF  | No          |

---

## REST API

All movie routes require `Authorization: Bearer <token>`.

| Method | Path              | Role required | Description       |
|--------|-------------------|---------------|-------------------|
| POST   | /api/auth/login   | —             | Returns JWT       |
| GET    | /api/movies       | any           | List all movies   |
| POST   | /api/movies       | any           | Create movie      |
| PUT    | /api/movies/:id   | any           | Update movie      |
| DELETE | /api/movies/:id   | MANAGER only  | Delete movie      |

**Movie fields:** `title` (string), `year` (1888–2100), `rating` (G · PG · M · MA · R)

---

## Architecture

```
Nginx :80
  ├── /api/*  → Express backend :3001
  └── /*      → React SPA (static, built by Vite)

Backend
  ├── JWT authentication (8h expiry)
  ├── Role-based route guards (MANAGER / TEAMLEADER / FLOORSTAFF)
  ├── Zod input validation
  ├── Helmet security headers
  └── SQLite via better-sqlite3 (WAL mode)

Frontend
  ├── MobX-State-Tree: RootStore → AuthStore + MovieStore
  ├── observer() components for reactive re-renders
  ├── Axios interceptor attaches JWT + handles 401 redirects
  └── Delete button hidden for non-managers (enforced on backend too)
```

# CRUD-Movie
