import { Router } from 'express';
import { PlantSpeciesController } from '../controllers/plant-species.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new PlantSpeciesController();

/**
 * @swagger
 * tags:
 *   - name: PlantSpecies
 *     description: Plant species directory
 */

/**
 * @swagger
 * /api/species:
 *   get:
 *     summary: Get all plant species
 *     tags: [PlantSpecies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plant species
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/species/{id}:
 *   get:
 *     summary: Get a plant species by ID
 *     tags: [PlantSpecies]
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
 *         description: Plant species details
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @swagger
 * /api/species:
 *   post:
 *     summary: Create a new plant species (ADMIN, FLORIST)
 *     tags: [PlantSpecies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scientificName
 *               - commonName
 *               - minSoilMoisture
 *               - maxSoilMoisture
 *             properties:
 *               scientificName:
 *                 type: string
 *                 example: Ficus elastica
 *               commonName:
 *                 type: string
 *                 example: Rubber Plant
 *               minSoilMoisture:
 *                 type: number
 *                 example: 30
 *               maxSoilMoisture:
 *                 type: number
 *                 example: 60
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         description: Forbidden (requires ADMIN or FLORIST role)
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'FLORIST']),
  controller.create
);

/**
 * @swagger
 * /api/species/{id}:
 *   put:
 *     summary: Update a plant species (ADMIN, FLORIST)
 *     tags: [PlantSpecies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plant species ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Partial update (any field can be updated)
 *             properties:
 *               scientificName:
 *                 type: string
 *                 example: Ficus elastica
 *               commonName:
 *                 type: string
 *                 example: Rubber Plant
 *               description:
 *                 type: string
 *                 example: Popular indoor plant
 *               minSoilMoisture:
 *                 type: number
 *                 example: 30
 *               maxSoilMoisture:
 *                 type: number
 *                 example: 60
 *               minTemperature:
 *                 type: number
 *                 example: 18
 *               maxTemperature:
 *                 type: number
 *                 example: 28
 *               minLightLux:
 *                 type: number
 *                 example: 200
 *               maxLightLux:
 *                 type: number
 *                 example: 800
 *               wateringFrequencyDays:
 *                 type: number
 *                 example: 7
 *               fertilizingFrequencyDays:
 *                 type: number
 *                 example: 30
 *     responses:
 *       200:
 *         description: Updated plant species
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'FLORIST']),
  controller.update
);

/**
 * @swagger
 * /api/species/{id}:
 *   delete:
 *     summary: Delete a plant species (ADMIN, FLORIST)
 *     tags: [PlantSpecies]
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
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'FLORIST']),
  controller.delete
);

export default router;
