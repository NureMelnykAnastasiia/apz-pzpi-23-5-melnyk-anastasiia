import { Router } from 'express';
import { SensorController } from '../controllers/sensor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new SensorController();

/**
 * @swagger
 * tags:
 *   - name: Sensors
 *     description: IoT sensor management
 */

/**
 * @swagger
 * /api/sensors:
 *   get:
 *     summary: Get all sensors
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sensors
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/sensors/{id}:
 *   get:
 *     summary: Get sensor by ID
 *     tags: [Sensors]
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
 *         description: Sensor details
 *       404:
 *         description: Sensor not found
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @swagger
 * /api/sensors:
 *   post:
 *     summary: Create a new sensor (ADMIN only)
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - macAddress
 *             properties:
 *               macAddress:
 *                 type: string
 *                 description: Unique MAC address
 *                 example: AA:BB:CC:11:22:33
 *               plantId:
 *                 type: string
 *                 format: uuid
 *                 description: Plant ID to assign the sensor
 *                 example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
 *               sensorModel:
 *                 type: string
 *                 example: ESP32-Soil-V2
 *               firmwareVersion:
 *                 type: string
 *                 example: 1.0.0
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Sensor created
 *       400:
 *         description: Sensor with this MAC address already exists
 *       403:
 *         description: Forbidden (ADMIN only)
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  controller.create
);

/**
 * @swagger
 * /api/sensors/{id}:
 *   put:
 *     summary: Fully update sensor (ADMIN only)
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - macAddress
 *               - isActive
 *             properties:
 *               macAddress:
 *                 type: string
 *                 example: AA:BB:CC:11:22:33
 *               plantId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               sensorModel:
 *                 type: string
 *                 nullable: true
 *               firmwareVersion:
 *                 type: string
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Sensor updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sensor not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.update
);

/**
 * @swagger
 * /api/sensors/{id}:
 *   delete:
 *     summary: Delete sensor (ADMIN only)
 *     tags: [Sensors]
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
 *         description: Sensor deleted
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
