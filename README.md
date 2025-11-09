
# ⚓ FuelEU Maritime Compliance Dashboard

A full-stack web application to simulate and validate compliance calculations under the EU FuelEU Maritime Regulation (EU) 2023/1805.
This system helps ship operators track greenhouse-gas intensity, calculate compliance balances, bank surplus credits, and form compliance pools — aligning with official regulation rules (Articles 20–21 & Annex IV).


## 🚀 Features
    
- Route Management
- Compliance Engine
- Banking (Article 20)
- Pooling (Article 21)


## Documentation

[Fuel EU Maritime Regulation (EU) 2023/1805, Annex IV and Articles 20–21](https://file.notion.so/f/f/b87c8e8a-b2b5-484b-8f29-dd49d349f1c2/77cebf3f-450a-40ae-b14c-2d7f629c7973/2025-May-ESSF-SAPS-WS1-FuelEU-calculation-methodologies_(1).pdf?table=block&id=29651e79-ddc8-809b-9189-c6448eaba642&spaceId=b87c8e8a-b2b5-484b-8f29-dd49d349f1c2&expirationTimestamp=1762740000000&signature=LBceTlrXMX_VD16YkYikFQarFp7tLf1whgfiRMyaB6g&downloadName=2025-May-ESSF-SAPS-WS1-FuelEU-calculation-methodologies.pdf)


## 🛠 Tech Stack

**Client:** React + Vite + TailwindCSS

**Server:** Node.js + Express + TypeScript

**Database:** PostgreSQL

**Testing:** Vitest + Supertest

**Containerization:** Docker & Docker-Compose

**Architecture:** Ports & Adapters (Hexagonal)


## 📦 Key Libraries

**Backend**

express

zod + zod-validation-error (request validation)

prisma (ORM)

postgres (database)

vitest & supertest (tests)

**Frontend**

react

axios

react-router-dom

tailwindcss

shadcn/ui components
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY` DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/fueleu?schema=public"
PORT=3001


`FRONTEND_API_KEY` VITE_API_URL=http://localhost:3001



## Deployment

To deploy this project run

```bash
For frontend backend both:
  npm run dev
  pnpm dev
```

