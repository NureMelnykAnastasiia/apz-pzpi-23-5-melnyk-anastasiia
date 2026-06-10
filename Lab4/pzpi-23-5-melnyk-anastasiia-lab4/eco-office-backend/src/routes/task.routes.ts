import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TaskController();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task planning and queue management
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: ADMIN and FLORIST can see all tasks; other roles see tasks assigned to their role
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task details
 *     description: Returns detailed information about a specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task (ADMIN and FLORIST only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plantId
 *               - requiredRole
 *               - type
 *             properties:
 *               plantId:
 *                 type: string
 *                 format: uuid
 *                 example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
 *                 description: Plant ID related to this task
 *               requiredRole:
 *                 type: string
 *                 enum: [ADMIN, OFFICE_MANAGER, FLORIST, CLEANER]
 *                 example: CLEANER
 *                 description: Role responsible for executing the task
 *               type:
 *                 type: string
 *                 enum: [WATERING, FERTILIZING, LIGHT_ADJUSTMENT, PEST_CONTROL, CLEANING]
 *                 example: WATERING
 *                 description: Task type
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 example: 2
 *                 description: Task priority (1 = Normal, 3 = Urgent)
 *               description:
 *                 type: string
 *                 example: Water the plant with 200ml of water
 *                 description: Task instructions or notes
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-07T10:00:00Z
 *                 description: Task deadline
 *     responses:
 *       201:
 *         description: Task successfully created
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(['ADMIN', 'FLORIST']), controller.create);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task details
 *     description: Updates task information (ADMIN and FLORIST only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantId:
 *                 type: string
 *                 format: uuid
 *               requiredRole:
 *                 type: string
 *                 enum: [ADMIN, OFFICE_MANAGER, FLORIST, CLEANER]
 *               type:
 *                 type: string
 *                 enum: [WATERING, FERTILIZING, LIGHT_ADJUSTMENT, PEST_CONTROL, CLEANING]
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task successfully updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'FLORIST']), controller.update);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     description: Accessible by ADMIN, FLORIST, or the assigned executor role
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED, SKIPPED]
 *                 example: COMPLETED
 *                 description: New task status
 *     responses:
 *       200:
 *         description: Task status successfully updated
 *       403:
 *         description: You do not have permission to update this task
 */
router.patch('/:id/status', authenticate, controller.updateStatus);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Deletes a task (ADMIN and FLORIST only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task successfully deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'FLORIST']), controller.delete);


export default router;
