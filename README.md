# Fairway Forward

A subscription-based golf performance-tracking platform with monthly prize draws and charitable giving. Built with the MERN stack.

## Features

- **Subscription system** — Monthly (£9.99) and yearly (£99) plans with demo activation (Stripe-ready)
- **Score tracking** — Rolling window of 5 Stableford scores (1–45)
- **Prize draws** — 3/4/5-number match tiers with random or frequency-weighted generation
- **Prize pool** — 25% of active revenue, split 40/35/25 with 5-match jackpot rollover
- **Charity giving** — 10%+ subscription allocation + one-time donations
- **Winner verification** — Screenshot upload, admin approve/reject, payout tracking
- **Admin dashboard** — Users, draws (simulate + publish), charities, winners, analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, JavaScript, Tailwind CSS, Framer Motion, TanStack Query, Zustand |
| Backend | Node.js, Express, JavaScript, Mongoose |
| Auth | JWT (access + refresh), bcrypt, helmet, rate-limit |
| Database | MongoDB |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB URI and secrets.

### 3. Seed the database

```bash
npm run seed
```

### 4. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fairwayforward.com | Admin123! |
| Subscriber | demo@fairwayforward.com | User12345! |

The demo subscriber has an active subscription and 5 pre-loaded scores.

## Project Structure

```
fair_c/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Route pages
│       ├── components/
│       ├── lib/     # API client
│       └── store/   # Zustand auth store
├── server/          # Express backend
│   └── src/
│       ├── domain/  # Pure business logic (tested)
│       ├── models/  # Mongoose schemas
│       ├── routes/
│       ├── services/
│       └── middleware/
└── package.json     # Workspace root
```

## Running Tests

```bash
npm test
```

Tests cover prize pool calculation and draw matching logic.

## Production Deployment

1. **Frontend** — Deploy `client/` to Vercel or Netlify
2. **Backend** — Deploy `server/` to Render or Railway
3. **Database** — MongoDB Atlas
4. **Stripe** — Set `STRIPE_*` env vars and replace demo subscribe with Checkout Sessions
5. **Email** — Integrate Resend/SendGrid for draw results and winner alerts
6. **File uploads** — Swap local Multer storage for S3/Cloudinary

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in |
| `GET /api/me` | Dashboard data |
| `POST /api/scores` | Add score (subscription required) |
| `GET /api/charities` | List charities |
| `POST /api/billing/demo-subscribe` | Activate demo subscription |
| `POST /api/admin/draws/:period/simulate` | Preview draw |
| `POST /api/admin/draws/:period/publish` | Publish draw + create winners |

## License

Private — client deliverable.
