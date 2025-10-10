import express from 'express';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the service request
 *         title:
 *           type: string
 *           description: Request title
 *         description:
 *           type: string
 *           description: Detailed request description
 *         service:
 *           type: string
 *           description: Requested service type
 *         clientId:
 *           type: string
 *           description: ID of the client making the request
 *         status:
 *           type: string
 *           enum: [open, assigned, in_progress, completed, cancelled]
 *           description: Current request status
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Request priority level
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
 *             preferredDate:
 *               type: string
 *               format: date
 *               description: Preferred service date
 *             flexibility:
 *               type: string
 *               enum: [exact, flexible, anytime]
 *               description: Date flexibility
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: URLs of attached files/images
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Request creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last request update timestamp
 *     RequestStats:
 *       type: object
 *       properties:
 *         totalRequests:
 *           type: integer
 *           description: Total number of service requests
 *         openRequests:
 *           type: integer
 *           description: Number of open requests
 *         urgentRequests:
 *           type: integer
 *           description: Number of urgent requests
 *         averageResponseTime:
 *           type: number
 *           description: Average response time in hours
 */

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all service requests
 *     tags: [Requests]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, assigned, in_progress, completed, cancelled]
 *         description: Filter by request status
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Filter by service type
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Maximum number of requests to return
 *     responses:
 *       200:
 *         description: List of service requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceRequest'
 *                 total:
 *                   type: integer
 */

// Mock data for requests
const mockRequests = [
  {
    id: 'req-1',
    title: 'Réparation fuite d\'eau sous évier',
    description: 'Fuite importante sous l\'évier de la cuisine, besoin d\'intervention urgente',
    service: 'Plomberie',
    clientId: 'client-1',
    status: 'open',
    priority: 'urgent',
    budget: {
      min: 80,
      max: 150,
      currency: 'EUR'
    },
    location: {
      address: '15 Rue de la Paix, Paris 75001',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    attachments: [],
    preferredSchedule: 'Aujourd\'hui si possible'
  },
  {
    id: 'req-2',
    title: 'Installation climatisation chambre',
    description: 'Installation d\'un climatiseur dans la chambre parentale',
    service: 'Climatisation',
    clientId: 'client-2',
    status: 'assigned',
    priority: 'normal',
    budget: {
      min: 300,
      max: 500,
      currency: 'EUR'
    },
    location: {
      address: '25 Avenue des Champs-Élysées, Paris 75008',
      coordinates: { lat: 48.8698, lng: 2.3076 }
    },
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    attachments: [],
    preferredSchedule: 'Cette semaine'
  },
  {
    id: 'req-3',
    title: 'Peinture salon et couloir',
    description: 'Repeindre le salon et le couloir en blanc cassé',
    service: 'Peinture',
    clientId: 'client-3',
    status: 'in_progress',
    priority: 'low',
    budget: {
      min: 200,
      max: 350,
      currency: 'EUR'
    },
    location: {
      address: '8 Boulevard Saint-Michel, Paris 75005',
      coordinates: { lat: 48.8462, lng: 2.3444 }
    },
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    attachments: [],
    preferredSchedule: 'Dans les 2 semaines'
  }
];

router.get('/', (req, res) => {
  // Mock implementation
  res.json({
    data: mockRequests,
    total: mockRequests.length,
  });
});

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get service request by ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Service request found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceRequest'
 *       404:
 *         description: Request not found
 */
router.get('/:id', (req, res) => {
  // Mock implementation
  res.status(404).json({ error: 'Request not found' });
});

/**
 * @swagger
 * /api/requests/urgent/list:
 *   get:
 *     summary: Get urgent service requests
 *     tags: [Requests]
 *     responses:
 *       200:
 *         description: List of urgent service requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 */
router.get('/urgent/list', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/requests/stats/overview:
 *   get:
 *     summary: Get request statistics
 *     tags: [Requests]
 *     responses:
 *       200:
 *         description: Request platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestStats'
 */
router.get('/stats/overview', (req, res) => {
  // Mock implementation
  res.json({
    totalRequests: 0,
    openRequests: 0,
    urgentRequests: 0,
    averageResponseTime: 0,
  });
});

/**
 * @swagger
 * /api/requests/recent/list:
 *   get:
 *     summary: Get recent service requests
 *     tags: [Requests]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: Maximum number of requests to return
 *     responses:
 *       200:
 *         description: List of recent service requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 */
router.get('/recent/list', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/requests/category/{category}:
 *   get:
 *     summary: Get requests by category
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Service category
 *     responses:
 *       200:
 *         description: List of requests in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceRequest'
 */
router.get('/category/:category', (req, res) => {
  // Mock implementation
  res.json([]);
});

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     summary: Update request status
 *     tags: [Service Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, assigned, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *       404:
 *         description: Request not found
 */
router.patch('/:id/status', (req, res) => {
  // Mock implementation
  res.json({
    message: 'Request status updated successfully',
    request: {
      id: req.params.id,
      status: req.body.status,
      updatedAt: new Date().toISOString(),
    }
  });
});

export default router;
