import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// health
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// quick /routes endpoint using Prisma (smoke test)
app.get("/routes", async (_req: Request, res: Response) => {
  const rows = await prisma.routes.findMany({ orderBy: { createdAt: "desc" } });
  res.json(rows);
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`API on :${PORT}`));
