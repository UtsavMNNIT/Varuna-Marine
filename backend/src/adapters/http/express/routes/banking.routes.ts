import { Router, Request, Response } from 'express';
import { bankSurplus, applyBanked } from '../../../../application/use-cases';
import { prisma } from '../../../outbound/postgres/prisma-client';
import { validate } from '../middleware/validate';
import { bankSurplusSchema, applyBankedSchema, bankingQuerySchema } from '../validation/banking.schema';

export function createBankingRouter(): Router {
  const router = Router();

  // POST /banking/bank-surplus - Bank surplus compliance units
  router.post(
    '/bank-surplus',
    validate(bankSurplusSchema),
    async (req: Request, res: Response) => {
      try {
        const { surplusUnits, bankingDate, maxBankingCapacity, bankingValidityYears } = req.body;

        const date = typeof bankingDate === 'string' ? new Date(bankingDate) : bankingDate;

        const result = bankSurplus({
          surplusUnits,
          bankingDate: date,
          maxBankingCapacity,
          bankingValidityYears,
        });

        // Optionally save to database
        // await prisma.bankEntry.create({
        //   data: {
        //     shipId: req.body.shipId, // Would need to be in request
        //     units: result.bankedUnits,
        //     bankedAt: result.bankedAt,
        //     expiryDate: result.expiryDate,
        //   },
        // });

        res.status(201).json({ result });
      } catch (error) {
        res.status(500).json({ error: 'Failed to bank surplus', message: (error as Error).message });
      }
    }
  );

  // POST /banking/apply-banked - Apply banked units to cover deficit
  router.post(
    '/apply-banked',
    validate(applyBankedSchema),
    async (req: Request, res: Response) => {
      try {
        const { deficit, applicationDate, availableBankedUnits } = req.body;

        const appDate = typeof applicationDate === 'string' ? new Date(applicationDate) : applicationDate;

        const bankedUnits = availableBankedUnits.map((unit: any) => ({
          id: unit.id,
          units: unit.units,
          bankedAt: typeof unit.bankedAt === 'string' ? new Date(unit.bankedAt) : unit.bankedAt,
          expiryDate: typeof unit.expiryDate === 'string' ? new Date(unit.expiryDate) : unit.expiryDate,
        }));

        const result = applyBanked({
          deficit,
          applicationDate: appDate,
          availableBankedUnits: bankedUnits,
        });

        res.json({ result });
      } catch (error) {
        res.status(500).json({ error: 'Failed to apply banked units', message: (error as Error).message });
      }
    }
  );

  // GET /banking/entries - Get bank entries (optional - if you want to query from DB)
  router.get(
    '/entries',
    validate(bankingQuerySchema),
    async (req: Request, res: Response) => {
      try {
        const { shipId, expired } = req.query;

        const where: any = {};
        if (shipId) {
          where.shipId = shipId;
        }
        if (expired !== undefined) {
          if (expired) {
            where.expiryDate = { lt: new Date() };
          } else {
            where.expiryDate = { gte: new Date() };
          }
        }

        const entries = await prisma.bankEntry.findMany({
          where,
          orderBy: { bankedAt: 'desc' },
        });

        res.json({ entries });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bank entries', message: (error as Error).message });
      }
    }
  );

  return router;
}

