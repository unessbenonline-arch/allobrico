import express from 'express';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project
 *         title:
 *           type: string
 *           description: Project title
 *         description:
 *           type: string
 *           description: Detailed project description
 *         category:
 *           type: string
 *           description: Project category
 *         clientId:
 *           type: string
 *           description: ID of the client who created the project
 *         workerId:
 *           type: string
 *           description: ID of the assigned worker
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *           description: Current project status
 *         budget:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *               description: Minimum budget
 *             max:
 *               type: number
 *               description: Maximum budget
 *             currency:
 *               type: string
 *               default: EUR
 *               description: Currency code
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               description: Street address
 *             city:
 *               type: string
 *               description: City
 *             postalCode:
 *               type: string
 *               description: Postal code
 *         timeline:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               description: Project start date
 *             endDate:
 *               type: string
 *               format: date
 *               description: Project end date
 *             estimatedDuration:
 *               type: integer
 *               description: Estimated duration in days
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Project creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last project update timestamp
 *     ProjectStats:
 *       type: object
 *       properties:
 *         totalProjects:
 *           type: integer
 *           description: Total number of projects
 *         activeProjects:
 *           type: integer
 *           description: Number of active projects
 *         completedProjects:
 *           type: integer
 *           description: Number of completed projects
 *         averageBudget:
 *           type: number
 *           description: Average project budget
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: workerId
 *         schema:
 *           type: string
 *         description: Filter by worker ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Maximum number of projects to return
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 total:
 *                   type: integer
 */

// Mock data for projects
const mockProjects = [
  {
    id: 'proj-1',
    title: 'Rénovation salle de bain complète',
    description: 'Rénovation complète de la salle de bain : dépose du carrelage ancien, installation WC, douche et lavabo neufs',
    category: 'Plomberie',
    clientId: 'client-1',
    workerId: 'worker-1',
    status: 'in_progress',
    budget: {
      min: 2500,
      max: 3500,
      currency: 'EUR'
    },
    location: {
      address: '15 Rue de la Paix, Paris 75001',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    startDate: '2024-01-16T08:00:00Z',
    endDate: '2024-01-20T17:00:00Z',
    progress: 65,
    milestones: [
      { id: 'mil-1', title: 'Dépose anciens équipements', completed: true, dueDate: '2024-01-16T12:00:00Z' },
      { id: 'mil-2', title: 'Installation plomberie', completed: true, dueDate: '2024-01-17T16:00:00Z' },
      { id: 'mil-3', title: 'Pose carrelage', completed: false, dueDate: '2024-01-18T16:00:00Z' },
      { id: 'mil-4', title: 'Installation équipements', completed: false, dueDate: '2024-01-19T16:00:00Z' }
    ]
  },
  {
    id: 'proj-2',
    title: 'Installation électrique cuisine',
    description: 'Installation complète du réseau électrique pour une nouvelle cuisine américaine',
    category: 'Électricité',
    clientId: 'client-2',
    workerId: 'worker-2',
    status: 'completed',
    budget: {
      min: 1200,
      max: 1800,
      currency: 'EUR'
    },
    location: {
      address: '25 Avenue des Champs-Élysées, Paris 75008',
      coordinates: { lat: 48.8698, lng: 2.3076 }
    },
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    startDate: '2024-01-08T08:00:00Z',
    endDate: '2024-01-12T17:00:00Z',
    progress: 100,
    milestones: [
      { id: 'mil-5', title: 'Étude et préparation', completed: true, dueDate: '2024-01-08T12:00:00Z' },
      { id: 'mil-6', title: 'Installation câblage', completed: true, dueDate: '2024-01-10T16:00:00Z' },
      { id: 'mil-7', title: 'Pose prises et interrupteurs', completed: true, dueDate: '2024-01-11T16:00:00Z' },
      { id: 'mil-8', title: 'Contrôles et finitions', completed: true, dueDate: '2024-01-12T16:00:00Z' }
    ]
  },
  {
    id: 'proj-3',
    title: 'Peinture appartement 3 pièces',
    description: 'Repeinture complète d\'un appartement de 3 pièces : salon, chambres et couloir',
    category: 'Peinture',
    clientId: 'client-3',
    workerId: 'worker-3',
    status: 'pending',
    budget: {
      min: 800,
      max: 1200,
      currency: 'EUR'
    },
    location: {
      address: '8 Boulevard Saint-Michel, Paris 75005',
      coordinates: { lat: 48.8462, lng: 2.3444 }
    },
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-14T11:00:00Z',
    startDate: null,
    endDate: null,
    progress: 0,
    milestones: []
  }
];

router.get('/', (req, res) => {
  const { workerId, status, category, limit = '20' } = req.query;
  let projects = mockProjects;

  // Filter by workerId if provided
  if (workerId && workerId !== 'undefined') {
    projects = projects.filter(project => project.workerId === workerId);
  }

  // Filter by status if provided
  if (status) {
    projects = projects.filter(project => project.status === status);
  }

  // Filter by category if provided
  if (category) {
    projects = projects.filter(project => project.category === category);
  }

  // Apply limit
  const limitedProjects = projects.slice(0, parseInt(limit as string));

  res.json({
    data: limitedProjects,
    total: projects.length,
  });
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/:id', (req, res) => {
  // Mock implementation
  res.status(404).json({ error: 'Project not found' });
});

/**
 * @swagger
 * /api/projects/stats/overview:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Project platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectStats'
 */
router.get('/stats/overview', (req, res) => {
  // Mock implementation
  res.json({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageBudget: 0,
  });
});

/**
 * @swagger
 * /api/projects/recent/list:
 *   get:
 *     summary: Get recent projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: Maximum number of projects to return
 *     responses:
 *       200:
 *         description: List of recent projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get('/recent/list', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/projects/category/{category}:
 *   get:
 *     summary: Get projects by category
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Project category
 *     responses:
 *       200:
 *         description: List of projects in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get('/category/:category', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/projects/{id}/progress:
 *   post:
 *     summary: Add progress update to a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Progress update description
 *               milestoneId:
 *                 type: string
 *                 description: Associated milestone ID (optional)
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Progress photos
 *     responses:
 *       201:
 *         description: Progress update added successfully
 *       404:
 *         description: Project not found
 */
router.post('/:id/progress', (req, res) => {
  // Mock implementation - in real app, handle file uploads and save to database
  res.status(201).json({
    message: 'Progress update added successfully',
    update: {
      id: `update-${Date.now()}`,
      projectId: req.params.id,
      description: req.body.description,
      milestoneId: req.body.milestoneId,
      photos: [], // Would contain uploaded photo URLs
      timestamp: new Date().toISOString(),
    }
  });
});

/**
 * @swagger
 * /api/projects/{id}/progress:
 *   get:
 *     summary: Get progress updates for a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of progress updates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   projectId:
 *                     type: string
 *                   description:
 *                     type: string
 *                   photos:
 *                     type: array
 *                     items:
 *                       type: string
 *                   timestamp:
 *                     type: string
 *                   milestoneId:
 *                     type: string
 */
router.get('/:id/progress', (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 'update-1',
      projectId: req.params.id,
      description: 'Début des travaux de plomberie - installation des nouvelles canalisations',
      photos: ['/uploads/progress/photo1.jpg', '/uploads/progress/photo2.jpg'],
      timestamp: '2024-01-16T10:00:00Z',
      milestoneId: 'm2',
    },
    {
      id: 'update-2',
      projectId: req.params.id,
      description: 'Pose du carrelage terminée - 75% du sol couvert',
      photos: ['/uploads/progress/photo3.jpg'],
      timestamp: '2024-01-17T15:30:00Z',
    }
  ]);
});

/**
 * @swagger
 * /api/projects/{id}/milestones/{milestoneId}/complete:
 *   patch:
 *     summary: Mark milestone as completed
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *         description: Milestone ID
 *     responses:
 *       200:
 *         description: Milestone marked as completed
 *       404:
 *         description: Project or milestone not found
 */
router.patch('/:id/milestones/:milestoneId/complete', (req, res) => {
  // Mock implementation
  res.json({
    message: 'Milestone marked as completed',
    milestone: {
      id: req.params.milestoneId,
      completed: true,
      completedAt: new Date().toISOString(),
    }
  });
});

/**
 * @swagger
 * /api/workers/{workerId}/portfolio:
 *   get:
 *     summary: Get worker portfolio
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker portfolio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   beforeImages:
 *                     type: array
 *                     items:
 *                       type: string
 *                   afterImages:
 *                     type: array
 *                     items:
 *                       type: string
 *                   completionDate:
 *                     type: string
 *                   clientRating:
 *                     type: number
 *                   clientReview:
 *                     type: string
 */
router.get('/workers/:workerId/portfolio', (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 'portfolio-1',
      title: 'Rénovation cuisine moderne',
      description: 'Transformation complète d\'une cuisine traditionnelle en espace moderne et fonctionnel',
      category: 'Cuisine',
      images: ['/uploads/portfolio/cuisine1.jpg', '/uploads/portfolio/cuisine2.jpg'],
      beforeImages: ['/uploads/portfolio/cuisine_before1.jpg'],
      afterImages: ['/uploads/portfolio/cuisine_after1.jpg', '/uploads/portfolio/cuisine_after2.jpg'],
      completionDate: '2024-01-15',
      clientRating: 5,
      clientReview: 'Excellent travail, très professionnel et soigné.'
    }
  ]);
});

/**
 * @swagger
 * /api/workers/{workerId}/portfolio:
 *   post:
 *     summary: Add project to worker portfolio
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               completionDate:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               beforeImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               afterImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Portfolio item added successfully
 */
router.post('/workers/:workerId/portfolio', (req, res) => {
  // Mock implementation
  res.status(201).json({
    message: 'Portfolio item added successfully',
    item: {
      id: `portfolio-${Date.now()}`,
      workerId: req.params.workerId,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      completionDate: req.body.completionDate,
      images: [], // Would contain uploaded image URLs
      beforeImages: [],
      afterImages: [],
      createdAt: new Date().toISOString(),
    }
  });
});

export default router;
