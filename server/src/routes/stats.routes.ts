import { Router } from 'express';
import * as ctrl from '../controllers/stats.controller';

const router = Router();

router.get('/by-category', ctrl.getByCategory);
router.get('/monthly',     ctrl.getMonthly);

export default router;
