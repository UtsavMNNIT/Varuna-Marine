import express, { Express } from 'express';
import { RouteRepository } from '../../../core/ports/RouteRepository';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { PoolRepository } from '../../../core/ports/PoolRepository';
import { createRoutesRouter } from './routes/routes.routes';
import { createComplianceRouter } from './routes/compliance.routes';
import { createBankingRouter } from './routes/banking.routes';
import { createPoolsRouter } from './routes/pools.routes';

export function createApp(
  routeRepository: RouteRepository,
  complianceRepository: ComplianceRepository,
  poolRepository: PoolRepository
): Express {
  const app = express();

  // Middleware
  app.use(express.json());

  // Routes
  app.use('/routes', createRoutesRouter(routeRepository));
  app.use('/compliance', createComplianceRouter(complianceRepository));
  app.use('/banking', createBankingRouter());
  app.use('/pools', createPoolsRouter(poolRepository));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}

