import { Router } from 'express';
import * as ctrl from '../controllers/budgets.controller';

const router = Router();

// GET /api/budgets?type=general|category
router.get('/status', ctrl.getStatus); // must be before /:id
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
