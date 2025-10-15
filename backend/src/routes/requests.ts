import express, { Request, Response } from 'express';
import { query } from '../database';

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

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, categoryId, clientId, limit = '20' } = req.query;

    let queryText = `
      SELECT
        r.id,
        r.title,
        r.description,
        c.name as category_name,
        r.status,
        r.priority,
        r.budget_min,
        r.budget_max,
        r.location,
        r.created_at,
        r.updated_at,
        u.first_name as client_first_name,
        u.last_name as client_last_name
      FROM requests r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.client_id = u.id
      WHERE 1=1
    `;
    let queryParams: any[] = [];

    if (status) {
      queryText += ` AND r.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (categoryId) {
      queryText += ` AND r.category_id = $${queryParams.length + 1}`;
      queryParams.push(categoryId);
    }

    if (clientId) {
      queryText += ` AND r.client_id = $${queryParams.length + 1}`;
      queryParams.push(clientId);
    }

    queryText += ' ORDER BY r.created_at DESC';

    if (limit && limit !== 'all') {
      queryText += ` LIMIT $${queryParams.length + 1}`;
      queryParams.push(parseInt(limit as string));
    }

    const result = await query(queryText, queryParams);

    // Transform database results to match frontend expectations
    const requests = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      service: row.category_name,
      clientId: row.client_id,
      status: row.status,
      priority: row.priority,
      budget: {
        min: row.budget_min,
        max: row.budget_max,
        currency: 'EUR'
      },
      location: {
        address: row.location,
        coordinates: null // Not stored in current schema
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      attachments: [],
      preferredSchedule: null, // Not in current schema
      clientName: `${row.client_first_name} ${row.client_last_name}`
    }));

    res.json({
      data: requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new service request
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - categoryId
 *               - clientId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               budgetMin:
 *                 type: number
 *               budgetMax:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, categoryId, clientId, priority, budget, location, preferredSchedule } = req.body;

    // Mock implementation
    const newRequest = {
      id: `request_${Date.now()}`,
      title,
      description,
      service: 'Mock Service',
      clientId,
      status: 'pending',
      priority: priority || 'normal',
      budget: budget || { min: 0, max: 1000, currency: 'EUR' },
      location: location || { address: 'Mock Address', coordinates: { lat: 48.8566, lng: 2.3522 } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      preferredSchedule
    };

    res.status(201).json({
      success: true,
      data: newRequest,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create request'
    });
  }
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
router.get('/:id', (req: Request, res: Response) => {
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
router.get('/urgent/list', (req: Request, res: Response) => {
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
router.get('/stats/overview', (req: Request, res: Response) => {
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
router.get('/recent/list', (req: Request, res: Response) => {
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
router.get('/category/:category', (req: Request, res: Response) => {
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
router.patch('/:id/status', (req: Request, res: Response) => {
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

/**
 * @swagger
 * /api/requests/{id}/offers:
 *   post:
 *     summary: Submit an offer for a service request
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workerId:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               timeline:
 *                 type: string
 *               availability:
 *                 type: string
 *     responses:
 *       201:
 *         description: Offer submitted successfully
 */
router.post('/:id/offers', (req: Request, res: Response) => {
  const { id } = req.params;
  const { workerId, price, description, timeline, availability } = req.body;

  // Mock offer creation
  const offer = {
    id: Date.now().toString(),
    requestId: id,
    workerId,
    price,
    description,
    timeline,
    availability,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({
    message: 'Offer submitted successfully',
    offer
  });
});

/**
 * @swagger
 * /api/requests/{id}/offers:
 *   get:
 *     summary: Get all offers for a service request
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 */
router.get('/:id/offers', (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock offers data
  const mockOffers = [
    {
      id: '1',
      requestId: id,
      workerId: 'worker1',
      workerName: 'Jean Martin',
      price: 450,
      description: 'Je propose mes services pour cette réparation. J\'ai 10 ans d\'expérience en plomberie.',
      timeline: '2-3 jours',
      availability: 'Disponible dès lundi',
      status: 'pending',
      createdAt: '2024-03-16T10:00:00Z',
    },
    {
      id: '2',
      requestId: id,
      workerId: 'worker2',
      workerName: 'Pierre Dubois',
      price: 520,
      description: 'Artisan qualifié avec assurance décennale. Intervention rapide garantie.',
      timeline: '1-2 jours',
      availability: 'Disponible cette semaine',
      status: 'pending',
      createdAt: '2024-03-16T11:30:00Z',
    }
  ];

  res.json({
    offers: mockOffers
  });
});

/**
 * @swagger
 * /api/requests/{requestId}/offers/{offerId}/status:
 *   put:
 *     summary: Update offer status (accept/reject)
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Offer status updated successfully
 */
router.put('/:requestId/offers/:offerId/status', (req: Request, res: Response) => {
  const { requestId, offerId } = req.params;
  const { status } = req.body;

  // Mock offer status update
  res.json({
    message: 'Offer status updated successfully',
    offer: {
      id: offerId,
      requestId,
      status,
      updatedAt: new Date().toISOString(),
    }
  });
});

export default router;
