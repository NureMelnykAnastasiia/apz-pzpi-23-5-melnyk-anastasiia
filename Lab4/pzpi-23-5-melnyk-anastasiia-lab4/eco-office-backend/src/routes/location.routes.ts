import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new LocationController();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Office rooms and zones management
 */

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations
 *     description: Returns a list of all office rooms and zones with related plants
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of locations
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location details
 *     description: Returns detailed information about a specific office location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location details
 *       404:
 *         description: Location not found
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create a new location
 *     description: Creates a new office room or zone (ADMIN and OFFICE_MANAGER only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Open Space 1
 *                 description: Name of the room or office zone
 *               floorNumber:
 *                 type: integer
 *                 example: 3
 *                 description: Floor number where the location is situated
 *               description:
 *                 type: string
 *                 example: Main relaxation area
 *                 description: Additional description of the location
 *               mapImageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: https://example.com/maps/floor3.jpg
 *                 description: URL to a map or floor plan image
 *     responses:
 *       201:
 *         description: Location successfully created
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(['ADMIN', 'OFFICE_MANAGER']), controller.create);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Update a location
 *     description: Updates an existing office location (ADMIN and OFFICE_MANAGER only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the location
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
 *                 minLength: 2
 *                 example: Open Space 2
 *                 description: Name of the room or office zone
 *               floorNumber:
 *                 type: integer
 *                 example: 4
 *                 description: Floor number where the location is situated
 *               description:
 *                 type: string
 *                 example: Updated meeting area
 *                 description: Additional description of the location
 *               mapImageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: https://example.com/maps/floor4.jpg
 *                 description: URL to a map or floor plan image
 *     responses:
 *       200:
 *         description: Location successfully updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'OFFICE_MANAGER']), controller.update);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete a location
 *     description: Deletes an office room or zone (ADMIN and OFFICE_MANAGER only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the location
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Location successfully deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'OFFICE_MANAGER']), controller.delete);

export default router;
