import express from 'express';
import { query } from '../database';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkerProfile:
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
 *           description: User role (always 'worker')
 *         bio:
 *           type: string
 *           description: Worker's biography/description
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Worker's skills and specialties
 *         experience:
 *           type: integer
 *           description: Years of experience
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Worker's average rating
 *         reviewCount:
 *           type: integer
 *           description: Number of reviews received
 *         hourlyRate:
 *           type: number
 *           description: Worker's hourly rate in euros
 *         availability:
 *           type: boolean
 *           description: Whether the worker is currently available
 *         location:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *               description: City where worker operates
 *             postalCode:
 *               type: string
 *               description: Postal code
 *             radius:
 *               type: integer
 *               description: Service radius in km
 *         certifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Professional certifications
 *         portfolio:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Portfolio image URLs
 *         completedProjects:
 *           type: integer
 *           description: Number of completed projects
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last account update timestamp
 *     WorkerStats:
 *       type: object
 *       properties:
 *         totalWorkers:
 *           type: integer
 *           description: Total number of registered workers
 *         activeWorkers:
 *           type: integer
 *           description: Number of currently active workers
 *         averageRating:
 *           type: number
 *           description: Average rating across all workers
 *         totalReviews:
 *           type: integer
 *           description: Total number of reviews
 */

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Get all workers
 *     tags: [Workers]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by specialty
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by city/location
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by availability
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Maximum number of workers to return
 *     responses:
 *       200:
 *         description: List of workers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkerProfile'
 *                 total:
 *                   type: integer
 */
router.get('/', async (req, res) => {
  try {
    const { specialty, location, rating, urgent, limit = '20' } = req.query;

    let queryText = `
      SELECT
        id,
        first_name,
        last_name,
        specialty,
        rating,
        jobs_completed,
        worker_type,
        accepts_urgent,
        location,
        description,
        skills,
        certifications,
        hourly_rate,
        worker_status
      FROM users
      WHERE role = 'worker' AND status = 'active'
    `;
    let queryParams: any[] = [];

    if (specialty) {
      queryText += ' AND specialty = $1';
      queryParams.push(specialty);
    }

    if (location) {
      queryText += ` AND location ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${location}%`);
    }

    if (rating) {
      queryText += ` AND rating >= $${queryParams.length + 1}`;
      queryParams.push(parseFloat(rating as string));
    }

    if (urgent === 'true') {
      queryText += ' AND accepts_urgent = true';
    }

    queryText += ' ORDER BY rating DESC, jobs_completed DESC';

    if (limit && limit !== 'all') {
      queryText += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(parseInt(limit as string));
    }

    const result = await query(queryText, queryParams);

    // Transform database results to match frontend expectations
    const workers = result.rows.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      specialty: row.specialty,
      rating: parseFloat(row.rating),
      jobs: row.jobs_completed,
      type: row.worker_type || 'individual',
      urgent: row.accepts_urgent || false,
      location: row.location,
      description: row.description,
      experience: `${Math.floor(row.jobs_completed / 10) * 10}+ ans`,
      certifications: row.certifications || [],
      portfolio: [],
      reviews: [],
      availability: row.worker_status === 'available' ? 'Disponible' : 'Occupé',
      responseTime: 'Répond en moyenne en 2h',
      completedProjects: row.jobs_completed,
      specialties: row.skills || [row.specialty],
      status: row.worker_status || 'active'
    }));

    res.json({
      data: workers,
      total: workers.length,
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Get worker by ID
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker profile found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkerProfile'
 *       404:
 *         description: Worker not found
 */
router.get('/:id', (req, res) => {
  // Mock implementation
  res.status(404).json({ error: 'Worker not found' });
});

/**
 * @swagger
 * /api/workers/top-rated/list:
 *   get:
 *     summary: Get top-rated workers
 *     tags: [Workers]
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
 *                 $ref: '#/components/schemas/WorkerProfile'
 */
router.get('/top-rated/list', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/workers/available/list:
 *   get:
 *     summary: Get available workers
 *     tags: [Workers]
 *     responses:
 *       200:
 *         description: List of available workers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkerProfile'
 */
router.get('/available/list', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/workers/stats/overview:
 *   get:
 *     summary: Get worker statistics
 *     tags: [Workers]
 *     responses:
 *       200:
 *         description: Worker platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkerStats'
 */
router.get('/stats/overview', (req, res) => {
  // Mock implementation
  res.json({
    totalWorkers: 0,
    activeWorkers: 0,
    averageRating: 0,
    totalReviews: 0,
  });
});

/**
 * @swagger
 * /api/workers/skill/{skill}:
 *   get:
 *     summary: Get workers by skill
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: skill
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill/specialty to search for
 *     responses:
 *       200:
 *         description: List of workers with the specified skill
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkerProfile'
 */
router.get('/skill/:skill', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/workers/location/{city}:
 *   get:
 *     summary: Get workers by location
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: City to search in
 *     responses:
 *       200:
 *         description: List of workers in the specified city
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkerProfile'
 */
router.get('/location/:city', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/workers/{id}/requests:
 *   get:
 *     summary: Get requests assigned to a worker
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: List of requests assigned to the worker
 */
router.get('/:id/requests', (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 'request-1',
      title: 'Réparation fuite eau',
      description: 'Fuite sous l\'évier de la cuisine',
      status: 'in_progress',
      priority: 'high',
      category: 'Plomberie',
      client: {
        id: 'client-1',
        name: 'Marie Dupont',
        phone: '06 12 34 56 78',
        address: '15 rue de la Paix, Paris 75001'
      },
      location: 'Paris 15ème',
      budget: 150,
      createdAt: '2024-01-10T10:00:00Z',
      scheduledDate: '2024-01-12T14:00:00Z'
    }
  ]);
});

export default router;
