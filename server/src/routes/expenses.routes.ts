import { Router } from 'express';
import * as ctrl from '../controllers/expenses.controller';

const router = Router();

// GET /api/expenses?category=<id>&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
