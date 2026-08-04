# MedfiNet Frontend

**Track:** Health × Blockchain × Climate  
**Stack:** React 18 · Vite · TypeScript · TailwindCSS · Supabase · Algorand

MedfiNet is a consent-governed digital child identity and continuity-of-care platform for health, nutrition, and climate-emergency settings. This repository is the consumer and clinician web interface — it communicates with the MedfiNet backend API and the Supabase auth layer.

---

## Vision & Impact

MedfiNet puts a child's full health history — vaccinations, nutrition intake, emergency care — into a portable, tamper-proof digital record that works across facilities, connectivity levels, and climate-disrupted geographies.

- Clinicians scan NFC cards or QR codes to instantly access verified immunization records.
- Parents hold revocable consent tokens that govern exactly who can read their child's data.
- Health workers receive climate-response worklists that surface highest-risk children during emergencies.
- Offline-first synchronization keeps the app functional on 2G or intermittent connections.

---

## Architecture Overview

```
MedfiNet Frontend (React / Vite)
       │
       ├── Supabase JS SDK ──▶ Supabase Auth (JWT issue / refresh)
       │
       └── medfinetApiClient  ──▶ MedfiNet Backend API (Bearer token)
                                       ├── Identity & Consent
                                       ├── Immunization Records
                                       ├── Telemedicine Sessions
                                       ├── Rewards & Settlements
                                       ├── NFC Tap Events
                                       ├── Blockchain Certificate Verification
                                       └── Analytics & Governance
```

### Key Modules

| Module | Description |
|---|---|
| `src/auth` | Supabase sign-in, sign-up, password recovery, session management |
| `src/immunization` | Record creation, QR code generation and scanning |
| `src/nfc` | NFC tap listener, card provisioning flow |
| `src/telemedicine` | Consultation session booking and video-call interface |
| `src/rewards` | Token balance, redemption history, wallet link |
| `src/climate` | Climate-response worklists and emergency dashboards |
| `src/analytics` | Aggregate health metrics and visualizations |
| `src/offline` | LocalForage-backed sync queue for low-connectivity environments |
| `src/wallet` | Algorand wallet connection via PeraWallet |

---

## Features

- 🔐 **Supabase Auth** — Email/password, session persistence, automatic token refresh.
- 📋 **Digital Immunization Records** — Create, view, and share verified vaccination cards.
- 📱 **QR Code Generation & Scanning** — Instant record lookup with `qrcode.react` and `jsqr`.
- 📡 **NFC Tap Integration** — Tap NTAG215 wristbands to pull up a child's health record.
- 🩺 **Telemedicine** — Book and join remote consultations directly in the app.
- 🏆 **Rewards Dashboard** — View token balance, micro-incentive history, and redeem rewards.
- 🌿 **Climate-Response Worklists** — Prioritized field-worker task queues for disaster zones.
- 🗺️ **Interactive Maps** — Healthcare facility lookup with Leaflet and Mapbox GL.
- 📊 **Analytics & Charts** — Population-level health metrics with Chart.js.
- 🔗 **Algorand Wallet** — Connect PeraWallet to sign and verify on-chain health certificates.
- 📶 **Offline Support** — LocalForage sync queue keeps data current across connectivity gaps.

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Framework** | React 18, Vite, TypeScript |
| **Styling** | TailwindCSS |
| **Auth & Storage** | Supabase JS SDK |
| **Blockchain** | Algorand SDK, PeraWallet Connect |
| **Maps** | Leaflet, Mapbox GL |
| **Charts** | Chart.js |
| **HTTP** | Axios |
| **Offline Storage** | LocalForage |
| **Icons** | Phosphor Icons, Lucide React |
| **Payments** | Stripe React |
| **Testing** | Vitest, Testing Library |
| **Dev Tools** | ESLint, TypeScript, Vite |

---

## Installation

```bash
git clone https://github.com/Daniel419797/medfinet_frontend.git
cd medfinet_frontend
npm install
```

---

## Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in the required values:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_BASE_URL=https://medfinet-backend.onrender.com/api/v1
VITE_MAPBOX_TOKEN=<your-mapbox-token>
```

> ⚠️ Never commit `.env` to version control — all secrets must stay local or in your deployment platform's environment settings.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server (`http://localhost:5173`) |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint across all source files |
| `npm test` | Run the full Vitest unit-test suite |
| `npm run test:watch` | Run Vitest in interactive watch mode |

---

## Deployment

The frontend is deployed on [Render](https://render.com) as a static site.

1. Push to `main` — Render auto-deploys on new commits.
2. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`, and any other required env vars in **Render → Environment**.
3. Render runs `npm run build` and serves the `dist/` folder.

---

## Security

Never commit `.env`, Supabase keys, Mapbox tokens, or wallet mnemonics.  
The `medfinetApiClient` attaches a `Authorization: Bearer <token>` header on every API call using the active Supabase session token — no tokens are stored in plain `localStorage` beyond what Supabase SDK manages internally.

---

## Contact

For inquiries, partnerships, or collaboration opportunities reach out at **danieladedayooluwole@gmail.com**.

---

## License

This project does not include an open-source license and is considered **proprietary** by default.
