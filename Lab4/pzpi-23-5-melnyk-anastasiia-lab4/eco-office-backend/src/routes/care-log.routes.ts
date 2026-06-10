import { Router } from 'express';
import { CareLogController } from '../controllers/care-log.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CareLogController();

/**
 * @swagger
 * tags:
 *   name: CareLogs
 *   description: Plant care activity logs (history)
 */

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get last 100 care log records
 *     tags: [CareLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of care logs
 */
router.get(
  '/',
  authenticate,
  controller.getAll
);

/**
 * @swagger
 * /api/logs/plant/{plantId}:
 *   get:
 *     summary: Get care history for a specific plant
 *     tags: [CareLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: plantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant care history
 */
router.get(
  '/plant/:plantId',
  authenticate,
  controller.getByPlant
);

/**
 * @swagger
 * /api/logs/{id}:
 *   get:
 *     summary: Get care log record details
 *     tags: [CareLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Care log details
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  authenticate,
  controller.getById
);

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Complete a task (create care log entry)
 *     description: |
 *       **Simplified mode:** Provide only `taskId`
 *       (plantId and type will be resolved automatically).
 *
 *       **Manual mode:** Provide `plantId` and `type`
 *       (when performing an action without a task).
 *
 *       `performedByUserId` is taken automatically from the access token.
 *     tags: [CareLogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *                 format: uuid
 *                 description: Task ID (recommended)
 *               plantId:
 *                 type: string
 *                 format: uuid
 *                 description: Plant ID (required if taskId is not provided)
 *               type:
 *                 type: string
 *                 enum:
 *                   - WATERING
 *                   - FERTILIZING
 *                   - LIGHT_ADJUSTMENT
 *                   - PEST_CONTROL
 *                   - CLEANING
 *                 description: Action type (required if taskId is not provided)
 *               notes:
 *                 type: string
 *               verifiedByScan:
 *                 type: boolean
 *               performedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Care log created, task closed
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  controller.create
);

/**
 * @swagger
 * /api/logs/{id}:
 *   put:
 *     summary: Update care log record (ADMIN only)
 *     tags: [CareLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               verifiedByScan:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.update
);

/**
 * @swagger
 * /api/logs/{id}:
 *   delete:
 *     summary: Delete care log record (ADMIN only)
 *     tags: [CareLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.delete
);

export default router;
