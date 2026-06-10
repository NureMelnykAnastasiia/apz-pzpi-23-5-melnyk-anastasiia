import { Router } from 'express';
import { BackupController } from '../controllers/backup.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';

const router = Router();
const controller = new BackupController();


const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.sql') {
      return cb(new Error('Only .sql files are allowed'));
    }
    cb(null, true);
  }
});

/**
 * @swagger
 * tags:
 *   - name: Backups
 *     description: Database backup management (Admin only)
 */

/**
 * @swagger
 * /api/backups:
 *   get:
 *     summary: Get list of all backups on the server
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of backup files
 */
router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  controller.list
);

/**
 * @swagger
 * /api/backups:
 *   post:
 *     summary: Create a new database backup
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Backup created successfully
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  controller.create
);

/**
 * @swagger
 * /api/backups/download/{filename}:
 *   get:
 *     summary: Download a backup file
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup file download
 */
router.get(
  '/download/:filename',
  authenticate,
  authorize(['ADMIN']),
  controller.download
);

/**
 * @swagger
 * /api/backups/restore:
 *   post:
 *     summary: Restore database from backup file
 *     description: ⚠️ WARNING! This operation will overwrite the current database.
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Database restored successfully
 */
router.post(
  '/restore',
  authenticate,
  authorize(['ADMIN']),
  upload.single('file'),
  controller.restore
);

export default router;
