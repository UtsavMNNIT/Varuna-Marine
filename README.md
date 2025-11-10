
## 🚢 FuelEU Maritime Compliance Dashboard

A full-stack platform implementing core logic from
FuelEU Maritime Regulation (EU) 2023/1805 — including:

Route GHG tracking
Compliance Balance calculation
Banking surplus CO₂ credits
Pooling between vessels
Baseline vs comparison analysis
Interactive maritime GHG dashboard

This system simulates compliance workflows for vessels operating under the FuelEU program.


## ✅ Core Features

**🛣️ Routes Management**

    Add / list maritime routes
    Includes distance, vessel type, fuel type, GHG intensity, emissions, fuel consumption
    Assign a baseline route

**⚖️ Compare Tab**

    Compare baseline vs other routes
    GHG intensity (% diff)
    Compliant / Non-compliant status

**🌱 Compliance Engine**

Implements EU Annex IV logic

| Calculation   | Formula                      |
| ------------- | ---------------------------- |
| Energy (MJ)   | `fuelConsumption × 41,000`   |
| CB (tCO₂eq)   | `(Target − Actual) × Energy` |
| Target (2025) | `89.3368 gCO₂e/MJ`           |


Surplus → Positive CB ✅

Deficit → Negative CB ❌

**🏦 Banking (Article 20)**

    Bank surplus compliance credits
    Apply banked credits to deficits
    Prevent over-usage of banked pool

**⚓ Pooling (Article 21)**

    Create pool across multiple vessels
    Ensure deficit vessels don’t worsen
    Ensure surplus vessels don’t go negative
    Greedy redistribution algorithm

**📊 Dashboard UI**

    Tailwind UI + Recharts
    Tabs: Routes / Compare / Banking / Pooling
    Real-time feedback & validation


## 🧱 Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Frontend      | React + Vite + TailwindCSS              |
| Backend       | Node.js + Express + TypeScript          |
| Database      | PostgreSQL                              |
| ORM           | Prisma                                  |
| Dev Tools     | Docker, pnpm, Vitest                    |
| AI Assistance | Cursor AI + GitHub Copilot + OpenAI GPT |


## 📁 Architecture

**Hexagonal (Ports & Adapters)**

    src/
        core/
            domain/
            application/
            ports/
        adapters/
            inbound/http/
            outbound/postgres/
        infrastructure/
        server/
        db/
    shared/

✅ Business logic isolated from frameworks

✅ Domain-driven design

✅ Testable + scalable design

## 🧪 Testing

Vitest unit tests for:

    Compute CB
    Compare baseline
    Banking logic
    Pooling algorithm
    Supertest API validation

Run tests:

    npm run dev / npm start dev



## 🚀 Local Setup

Prerequisites

    Node 18+
    Docker Desktop
    pnpm (or npm/yarn)

**Clone repo**

    git clone https://github.com/UtsavMNNIT/Varuna-Marine.git
    cd FuelEU

**Backend**

    cd backend
    pnpm install
    docker compose up -d
    pnpm exec prisma migrate dev
    pnpm dev / npm run dev / npm start dev

**Frontend**

    cd frontend
    pnpm install
    pnpm dev /npm run dev / npm start dev

Frontend: http://localhost:3000

Backend API: http://localhost:3001



## 📂 Environment Variables

**Backend .env**

    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fueleu"
    PORT=3001

**Frontend .env**

    VITE_API_URL=http://localhost:3001




## 📎 Dataset Seed (Mock Fleet)

    5 ship routes
    Container, Bulk, RoRo, Tanker
    Baseline + 4 comparisons
    Realistic emissions + fuel consumption

Stored & seeded via Prisma migration
## 🤖 AI-Agent Collaboration

| Tool           | Role                                       |
| -------------- | ------------------------------------------ |
| Cursor AI      | Code scaffolding, refactor, file edits     |
| GitHub Copilot | Inline suggestions & boilerplate           |
| OpenAI GPT     | Architecture decisions, formula validation |

Manual verification performed for all compliance logic.

See: AGENT_WORKFLOW.md
## 📌 Future Enhancements

    EU MRV / ETS integration
    Advanced charts (CO₂ trajectory + energy mix)
    User auth + role based access (admin vs operator)
    API Digital twin for ship fleet simulation
## 🙌 Acknowledgements

    EU 2023/1805 FuelEU Maritime Regulation
    Prisma + Express + React communities
    AI coding partners (Cursor, Copilot, GPT)
