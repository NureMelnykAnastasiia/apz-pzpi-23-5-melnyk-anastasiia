import { Router } from 'express';
import { ReadingController } from '../controllers/reading.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ReadingController();

/**
 * @swagger
 * tags:
 *   - name: Readings
 *     description: Sensor readings (temperature, humidity, etc.)
 */

/**
 * @swagger
 * /api/readings:
 *   get:
 *     summary: Get latest 100 readings
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of readings
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/readings/iot:
 *   post:
 *     summary: Receive sensor readings from IoT bridge using device MAC address
 *     description: >
 *       Endpoint for receiving telemetry data from IoT devices.
 *       The device is identified by its MAC address.
 *     tags:
 *       - Readings
 *     security: []   # <-- отключает авторизацию для Swagger
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIoTReadingRequest'
 *     responses:
 *       201:
 *         description: Sensor reading successfully saved
 *       404:
 *         description: IoT device is not registered in the system
 *       400:
 *         description: Invalid request payload
 */
router.post('/iot', authenticate, controller.createFromIoT);




/**
 * @swagger
 * /api/readings/sensor/{sensorId}:
 *   get:
 *     summary: Get readings for a specific sensor
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sensor readings history
 */
router.get('/sensor/:sensorId', authenticate, controller.getBySensor);

/**
 * @swagger
 * /api/readings/{id}:
 *   get:
 *     summary: Get a reading by ID
 *     tags: [Readings]
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
 *         description: Reading details
 *       404:
 *         description: Reading not found
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @swagger
 * /api/readings:
 *   post:
 *     summary: Create a reading manually (ADMIN only)
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sensorId
 *               - type
 *               - value
 *             properties:
 *               sensorId:
 *                 type: string
 *                 format: uuid
 *                 description: Existing sensor ID
 *                 example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
 *               type:
 *                 type: string
 *                 enum:
 *                   - SOIL_MOISTURE
 *                   - AIR_TEMPERATURE
 *                   - AIR_HUMIDITY
 *                   - LIGHT_INTENSITY
 *                   - BATTERY_LEVEL
 *                 example: SOIL_MOISTURE
 *               value:
 *                 type: number
 *                 description: Numeric sensor value
 *                 example: 45.5
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional reading timestamp
 *     responses:
 *       201:
 *         description: Reading created
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
 * /api/readings/{id}:
 *   put:
 *     summary: Update a reading (ADMIN only)
 *     tags: [Readings]
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
 *               value:
 *                 type: number
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Reading updated
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
 * /api/readings/{id}:
 *   delete:
 *     summary: Delete an invalid reading (ADMIN only)
 *     tags: [Readings]
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
 *         description: Reading deleted
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
