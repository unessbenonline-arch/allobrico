import express from 'express';

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
router.get('/', (req, res) => {
  // Mock implementation - would connect to database in real app
  const mockWorkers = [
    {
      id: 1,
      name: 'Pierre Martin',
      specialty: 'Plomberie & Chauffage',
      rating: 4.8,
      jobs: 127,
      type: 'individual',
      urgent: false,
      location: 'Paris 15ème',
      description: 'Artisan expérimenté en plomberie avec plus de 10 ans d\'expérience',
      experience: '10+ ans',
      certifications: ['Qualification professionnelle', 'Assurance décennale'],
      portfolio: [
        { id: 1, title: 'Installation salle de bain', description: 'Rénovation complète' },
        { id: 2, title: 'Dépannage urgence', description: 'Intervention rapide' },
      ],
      reviews: [
        { id: 1, client: 'Marie D.', rating: 5, comment: 'Excellent travail, très professionnel', date: '2024-01-15' },
        { id: 2, client: 'Jean P.', rating: 5, comment: 'Intervention rapide et efficace', date: '2024-01-10' },
      ],
      availability: 'Disponible cette semaine',
      responseTime: 'Répond en moyenne en 1h',
      completedProjects: 127,
      specialties: ['Plomberie', 'Chauffage', 'Dépannages urgents'],
      status: 'active',
    },
    {
      id: 2,
      name: 'Sophie Leroy',
      specialty: 'Électricité & Domotique',
      rating: 4.9,
      jobs: 89,
      type: 'individual',
      urgent: true,
      location: 'Boulogne-Billancourt',
      description: 'Électricienne qualifiée spécialisée en domotique et rénovation électrique',
      experience: '8+ ans',
      certifications: ['Qualification électrique', 'Domotique certifiée'],
      portfolio: [
        { id: 1, title: 'Rénovation électrique', description: 'Mise aux normes complète' },
        { id: 2, title: 'Installation domotique', description: 'Maison connectée' },
      ],
      reviews: [
        { id: 1, client: 'Paul L.', rating: 5, comment: 'Travail impeccable, très compétente', date: '2024-01-12' },
        { id: 2, client: 'Anna M.', rating: 4, comment: 'Bon travail, délais respectés', date: '2024-01-08' },
      ],
      availability: 'Disponible en urgence',
      responseTime: 'Répond en moyenne en 30min',
      completedProjects: 89,
      specialties: ['Électricité', 'Domotique', 'Mise aux normes'],
      status: 'active',
    },
    {
      id: 3,
      name: 'TechPro Services',
      specialty: 'Peinture & Décoration',
      rating: 4.7,
      jobs: 203,
      type: 'company',
      urgent: false,
      location: 'Neuilly-sur-Seine',
      description: 'Entreprise spécialisée en peinture intérieure et extérieure, décoration d\'intérieur',
      experience: '15+ ans',
      certifications: ['Certification qualité', 'Éco-peinture'],
      portfolio: [
        { id: 1, title: 'Rénovation appartement', description: 'Peinture complète 5 pièces' },
        { id: 2, title: 'Décoration commerciale', description: 'Local commercial' },
      ],
      reviews: [
        { id: 1, client: 'Isabelle R.', rating: 5, comment: 'Équipe professionnelle, résultat parfait', date: '2024-01-14' },
        { id: 2, client: 'Michel B.', rating: 4, comment: 'Bon travail, prix correct', date: '2024-01-09' },
      ],
      availability: 'Disponible sous 48h',
      responseTime: 'Répond en moyenne en 2h',
      completedProjects: 203,
      specialties: ['Peinture intérieure', 'Peinture extérieure', 'Décoration'],
      status: 'active',
    },
    {
      id: 4,
      name: 'Jean Dupont',
      specialty: 'Menuiserie & Ebénisterie',
      rating: 4.6,
      jobs: 156,
      type: 'individual',
      urgent: false,
      location: 'Versailles',
      description: 'Menuisier ébéniste spécialisé dans les travaux sur mesure et la restauration',
      experience: '12+ ans',
      certifications: ['Brevet de maîtrise', 'Restauration du patrimoine'],
      portfolio: [
        { id: 1, title: 'Cuisine sur mesure', description: 'Création complète' },
        { id: 2, title: 'Restauration meubles', description: 'Antiquités' },
      ],
      reviews: [
        { id: 1, client: 'Claire S.', rating: 5, comment: 'Travail d\'exception, très créatif', date: '2024-01-13' },
        { id: 2, client: 'Robert D.', rating: 4, comment: 'Qualité excellente, délais respectés', date: '2024-01-07' },
      ],
      availability: 'Disponible sous 72h',
      responseTime: 'Répond en moyenne en 3h',
      completedProjects: 156,
      specialties: ['Menuiserie', 'Ébénisterie', 'Restauration'],
      status: 'active',
    },
  ];

  res.json({
    data: mockWorkers,
    total: mockWorkers.length,
  });
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
