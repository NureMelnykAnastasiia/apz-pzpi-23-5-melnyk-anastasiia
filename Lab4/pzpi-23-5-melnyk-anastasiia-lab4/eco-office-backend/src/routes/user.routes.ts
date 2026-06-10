import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new UserController();

router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Отримати список усіх користувачів
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список користувачів
 *       403:
 *         description: Недостатньо прав
 */
router.get(
  '/',
  authorize(['ADMIN']),
  controller.getAll.bind(controller)
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Отримати користувача за ID
 *     tags: [Users]
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
 *         description: Дані користувача
 *       404:
 *         description: Користувача не знайдено
 */
router.get(
  '/:id',
  authorize(['ADMIN']),
  controller.getById.bind(controller)
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Оновити користувача
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               fullName:
 *                 type: string
 *                 example: Ivan Petrenko
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               role:
 *                 type: string
 *                 enum:
 *                   - ADMIN
 *                   - OFFICE_MANAGER
 *                   - FLORIST
 *                   - CLEANER
 *     responses:
 *       200:
 *         description: Користувача оновлено
 *       404:
 *         description: Користувача не знайдено
 */
router.put(
  '/:id',
  authorize(['ADMIN']),
  controller.update.bind(controller)
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Видалити користувача
 *     tags: [Users]
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
 *         description: Користувача видалено
 *       404:
 *         description: Користувача не знайдено
 */
router.delete(
  '/:id',
  authorize(['ADMIN']),
  controller.delete.bind(controller)
);

export default router;