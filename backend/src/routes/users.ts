import express from 'express';
import { query } from '../database';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the client
 *         email:
 *           type: string
 *           format: email
 *           description: Client's email address
 *         firstName:
 *           type: string
 *           description: Client's first name
 *         lastName:
 *           type: string
 *           description: Client's last name
 *         phone:
 *           type: string
 *           description: Client's phone number
 *         avatar:
 *           type: string
 *           format: uri
 *           description: Client's avatar URL
 *         role:
 *           type: string
 *           enum: [client]
 *           description: User role (always 'client' for clients)
 *         address:
 *           type: string
 *           description: Client's address
 *         preferences:
 *           type: array
 *           items:
 *             type: string
 *           description: Client's preferred service categories
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last account update timestamp
 *     Worker:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the worker
 *         email:
 *           type: string
 *           format: email
 *           description: Worker's email address
 *         firstName:
 *           type: string
 *           description: Worker's first name
 *         lastName:
 *           type: string
 *           description: Worker's last name
 *         phone:
 *           type: string
 *           description: Worker's phone number
 *         avatar:
 *           type: string
 *           format: uri
 *           description: Worker's avatar URL
 *         role:
 *           type: string
 *           enum: [worker]
 *           description: User role (always 'worker' for workers)
 *         specialty:
 *           type: string
 *           description: Worker's specialty/service type
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Worker's average rating
 *         jobs:
 *           type: integer
 *           description: Number of completed jobs
 *         status:
 *           type: string
 *           enum: [active, inactive, busy]
 *           description: Worker's current status
 *         location:
 *           type: string
 *           description: Worker's service area
 *         type:
 *           type: string
 *           enum: [artisan, company]
 *           description: Whether individual artisan or company
 *         urgent:
 *           type: boolean
 *           description: Whether worker accepts urgent jobs
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last account update timestamp
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (clients and workers)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [client, worker]
 *         description: Filter by user role
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Maximum number of users to return
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/Client'
 *                       - $ref: '#/components/schemas/Worker'
 *                 total:
 *                   type: integer
 */
router.get('/', async (req, res) => {
  try {
    const { role, status, limit = '20' } = req.query;

    let queryText = `
      SELECT
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        status,
        created_at,
        updated_at
      FROM users
      WHERE 1=1
    `;
    let queryParams: any[] = [];

    if (role) {
      queryText += ` AND role = $${queryParams.length + 1}`;
      queryParams.push(role);
    }

    if (status) {
      queryText += ` AND status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    queryText += ' ORDER BY created_at DESC';

    if (limit && limit !== 'all') {
      queryText += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(parseInt(limit as string));
    }

    const result = await query(queryText, queryParams);

    res.json({
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Client'
 *                 - $ref: '#/components/schemas/Worker'
 *       404:
 *         description: User not found
 */
router.get('/:id', (req, res) => {
  // Mock implementation
  res.status(404).json({ error: 'User not found' });
});

/**
 * @swagger
 * /api/users/workers/top-rated:
 *   get:
 *     summary: Get top-rated workers
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: Maximum number of workers to return
 *     responses:
 *       200:
 *         description: List of top-rated workers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Worker'
 */
router.get('/workers/top-rated', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/users/workers/available:
 *   get:
 *     summary: Get available workers
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of available workers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Worker'
 */
router.get('/workers/available', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/users/workers/search:
 *   get:
 *     summary: Search workers by specialty
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty to search for
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location filter
 *     responses:
 *       200:
 *         description: List of matching workers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Worker'
 */
router.get('/workers/search', (req, res) => {
  // Mock implementation
  res.json([]);
});

export default router;
