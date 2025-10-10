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
  // Mock implementation
  res.json({
    data: mockProjects,
    total: mockProjects.length,
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

export default router;
