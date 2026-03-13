import { Router } from 'express';
import categoriesRouter from './categories.routes';
import expensesRouter from './expenses.routes';
import budgetsRouter from './budgets.routes';
import receiptsRouter from './receipts.routes';
import statsRouter    from './stats.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/categories', categoriesRouter);
router.use('/expenses', expensesRouter);
router.use('/budgets', budgetsRouter);
router.use('/receipts', receiptsRouter);
router.use('/stats', statsRouter);

export default router;
