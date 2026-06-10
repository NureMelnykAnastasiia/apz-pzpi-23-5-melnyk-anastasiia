import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new StatsController();

/**
 * @swagger
 * tags:
 *   - name: Stats
 *     description: System statistics and analytics (Admin/Florist)
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get system overview statistics
 *     tags:
 *       - Stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'FLORIST']),
  controller.getDashboard
);

export default router;
