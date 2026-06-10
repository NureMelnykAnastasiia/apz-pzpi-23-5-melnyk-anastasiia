import { Router } from 'express';
import { PlantController } from '../controllers/plant.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new PlantController();

/**
 * @swagger
 * tags:
 *   name: Plants
 *   description: Plant management
 */

/**
 * @swagger
 * /api/plants:
 *   get:
 *     summary: Get all plants
 *     description: Returns a list of all plants in the system
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plants
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/plants/floor/{floorNumber}:
 *   get:
 *     summary: Get plants by floor number
 *     description: Returns all plants located on a specific floor
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: floorNumber
 *         required: true
 *         description: Floor number
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of plants on the floor
 */
router.get('/floor/:floorNumber', authenticate, controller.getByFloor);

/**
 * @swagger
 * /api/plants/location/{locationId}:
 *   get:
 *     summary: Get plants by location
 *     description: Returns all plants located in a specific office room or zone
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of plants in the location
 */
router.get('/location/:locationId', authenticate, controller.getByLocation);

/**
 * @swagger
 * /api/plants/{id}/sensors:
 *   get:
 *     summary: Get sensors attached to a plant
 *     description: Returns all sensors connected to the specified plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Plant ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of plant sensors
 *       404:
 *         description: Plant not found
 */
router.get('/:id/sensors', authenticate, controller.getSensors);

/**
 * @swagger
 * /api/plants/{id}/readings:
 *   get:
 *     summary: Get latest sensor readings
 *     description: Returns plant sensors with the latest 5 readings for each sensor
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Plant ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sensor readings with history
 *       404:
 *         description: Plant not found
 */
router.get('/:id/readings', authenticate, controller.getReadings);

/**
 * @swagger
 * /api/plants/{id}:
 *   get:
 *     summary: Get plant details
 *     description: Returns detailed information about a specific plant
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Plant ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant details
 *       404:
 *         description: Plant not found
 */
router.get('/:id', authenticate, controller.getById);

// --- Admin / Florist Actions ---

/**
 * @swagger
 * /api/plants:
 *   post:
 *     summary: Create a new plant
 *     description: Adds a new plant (ADMIN and FLORIST only)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCodeId
 *               - speciesId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Office Ficus
 *                 description: Custom plant name
 *               qrCodeId:
 *                 type: string
 *                 example: QR-12345
 *                 description: Unique QR code identifier
 *               speciesId:
 *                 type: string
 *                 format: uuid
 *                 example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
 *                 description: Plant species ID
 *               locationId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22
 *                 description: Location ID where the plant is placed
 *               mapXCoordinate:
 *                 type: integer
 *                 example: 100
 *                 description: X coordinate on the location map
 *               mapYCoordinate:
 *                 type: integer
 *                 example: 200
 *                 description: Y coordinate on the location map
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: https://example.com/plant.jpg
 *                 description: URL of the plant photo
 *               healthStatus:
 *                 type: string
 *                 enum: [HEALTHY, NEEDS_ATTENTION, CRITICAL]
 *                 example: HEALTHY
 *                 description: Current health status of the plant
 *     responses:
 *       201:
 *         description: Plant successfully created
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize(['ADMIN', 'FLORIST']), controller.create);

/**
 * @swagger
 * /api/plants/{id}:
 *   put:
 *     summary: Update a plant
 *     description: Updates plant information (ADMIN and FLORIST only)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Plant ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Ficus
 *               qrCodeId:
 *                 type: string
 *                 example: QR-98765
 *               speciesId:
 *                 type: string
 *                 format: uuid
 *               locationId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               mapXCoordinate:
 *                 type: integer
 *               mapYCoordinate:
 *                 type: integer
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               healthStatus:
 *                 type: string
 *                 enum: [HEALTHY, NEEDS_ATTENTION, CRITICAL]
 *     responses:
 *       200:
 *         description: Plant successfully updated
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'FLORIST']), controller.update);

/**
 * @swagger
 * /api/plants/{id}:
 *   delete:
 *     summary: Delete a plant
 *     description: Removes a plant from the system (ADMIN and FLORIST only)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Plant ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Plant successfully deleted
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'FLORIST']), controller.delete);


export default router;
