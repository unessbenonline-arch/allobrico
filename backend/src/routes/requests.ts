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
        r.subcategory,
        c.name as category_name,
        c.icon as category_icon,
        r.status,
        r.priority,
        r.urgency,
        r.budget_min,
        r.budget_max,
        r.budget_type,
        r.currency,
        r.location,
        r.location_details,
        r.location_type,
        r.preferred_schedule,
        r.preferred_start_date,
        r.preferred_end_date,
        r.estimated_duration,
        r.duration_unit,
        r.requirements,
        r.special_instructions,
        r.contact_preference,
        r.complexity,
        r.scope,
        r.is_recurring,
        r.recurring_frequency,
        r.required_certifications,
        r.materials_provided_by,
        r.access_type,
        r.attachments,
        r.created_at,
        r.updated_at,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        w.id as assigned_worker_id,
        w.first_name as worker_first_name,
        w.last_name as worker_last_name,
        w.email as worker_email,
        w.phone as worker_phone,
        w.avatar as worker_avatar,
        w.description as worker_description,
        w.skills as worker_skills,
        w.jobs_completed as worker_experience,
        w.rating as worker_rating,
        w.jobs_completed as worker_review_count,
        w.hourly_rate as worker_hourly_rate,
        w.worker_status as worker_availability,
        w.certifications as worker_certifications,
        w.portfolio_urls as worker_portfolio,
        w.jobs_completed as worker_completed_projects,
        w.location as worker_location
      FROM requests r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.client_id = u.id
      LEFT JOIN users w ON r.assigned_worker_id = w.id
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
    const requests = result.rows.map(row => {
      const request: any = {
        id: row.id,
        title: row.title,
        description: row.description,
        service: row.category_name,
        categoryIcon: row.category_icon,
        subcategory: row.subcategory,
        clientId: row.client_id,
        status: row.status,
        priority: row.priority,
        urgency: row.urgency,
        budget: {
          min: row.budget_min,
          max: row.budget_max,
          type: row.budget_type,
          currency: row.currency
        },
        location: {
          address: row.location,
          details: row.location_details,
          type: row.location_type,
          coordinates: null // Not stored in current schema
        },
        scheduling: {
          preferredSchedule: row.preferred_schedule,
          preferredStartDate: row.preferred_start_date,
          preferredEndDate: row.preferred_end_date,
          estimatedDuration: row.estimated_duration,
          durationUnit: row.duration_unit
        },
        projectDetails: {
          complexity: row.complexity,
          scope: row.scope,
          materials: row.materials_provided_by,
          access: row.access_type,
          isRecurring: row.is_recurring,
          recurringFrequency: row.recurring_frequency
        },
        requirements: {
          technical: row.requirements,
          specialInstructions: row.special_instructions,
          certifications: row.required_certifications,
          contactPreference: row.contact_preference
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        attachments: row.attachments || [],
        clientName: `${row.client_first_name} ${row.client_last_name}`
      };      // Include assignee information if request is assigned
      if (row.assigned_worker_id && (row.status === 'assigned' || row.status === 'in_progress' || row.status === 'completed')) {
        request.assignedWorkerId = row.assigned_worker_id;
        request.assignee = {
          id: row.assigned_worker_id,
          name: `${row.worker_first_name} ${row.worker_last_name}`,
          email: row.worker_email,
          phone: row.worker_phone,
          avatar: row.worker_avatar,
          specialty: row.worker_skills?.[0] || 'Artisan',
          rating: row.worker_rating || 0,
          jobs: row.worker_review_count || 0,
          type: 'individual', // Could be determined from user type
          location: row.worker_location || 'Non spécifié',
          description: row.worker_description,
          experience: `${row.worker_experience || 0}+ ans`,
          certifications: row.worker_certifications || [],
          portfolio: row.worker_portfolio || [],
          reviews: [], // Would need separate query
          availability: row.worker_availability === 'available' ? 'Disponible' : 'Occupé',
          responseTime: 'Répond en moyenne en 2h', // Default
          completedProjects: row.worker_completed_projects || 0,
          specialties: row.worker_skills || [],
          status: row.worker_availability === 'available' ? 'available' : 'busy'
        };
      }

      return request;
    });

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
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      categoryId,
      subcategory,
      clientId,
      priority = 'normal',
      urgency = 'normal',
      budgetMin,
      budgetMax,
      budgetType = 'fixed',
      currency = 'EUR',
      location,
      locationDetails,
      locationType = 'home',
      preferredSchedule,
      preferredStartDate,
      preferredEndDate,
      estimatedDuration,
      durationUnit = 'hours',
      requirements,
      specialInstructions,
      contactPreference = 'both',
      complexity = 3,
      scope = 'small',
      recurring = false,
      recurringFrequency,
      certifications = [],
      materials = 'client',
      access = 'normal',
      attachments = []
    } = req.body;

    // Validate required fields
    if (!title || !description || !categoryId || !clientId) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, description, categoryId, and clientId are required'
      });
      return;
    }

    // Parse and validate data types
    const parsedEstimatedDuration = estimatedDuration ? parseInt(estimatedDuration.toString(), 10) : null;
    const parsedComplexity = complexity ? parseInt(complexity.toString(), 10) : 3;
    const parsedPreferredStartDate = preferredStartDate && preferredStartDate.trim() !== '' ? preferredStartDate : null;
    const parsedPreferredEndDate = preferredEndDate && preferredEndDate.trim() !== '' ? preferredEndDate : null;

    // Insert new request into database
    const insertQuery = `
      INSERT INTO requests (
        title,
        description,
        category_id,
        subcategory,
        client_id,
        priority,
        urgency,
        budget_min,
        budget_max,
        budget_type,
        currency,
        location,
        location_details,
        location_type,
        preferred_schedule,
        preferred_start_date,
        preferred_end_date,
        estimated_duration,
        duration_unit,
        requirements,
        special_instructions,
        contact_preference,
        complexity,
        scope,
        is_recurring,
        recurring_frequency,
        required_certifications,
        materials_provided_by,
        access_type,
        attachments,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
      RETURNING id, title, description, category_id, subcategory, client_id, status, priority, urgency,
                budget_min, budget_max, budget_type, currency, location, location_details, location_type,
                preferred_schedule, preferred_start_date, preferred_end_date, estimated_duration, duration_unit,
                requirements, special_instructions, contact_preference, complexity, scope, is_recurring,
                recurring_frequency, required_certifications, materials_provided_by, access_type,
                attachments, created_at, updated_at
    `;

    const values = [
      title,
      description,
      categoryId,
      subcategory,
      clientId,
      priority,
      urgency,
      budgetMin,
      budgetMax,
      budgetType,
      currency,
      location,
      locationDetails,
      locationType,
      preferredSchedule,
      parsedPreferredStartDate,
      parsedPreferredEndDate,
      parsedEstimatedDuration,
      durationUnit,
      requirements,
      specialInstructions,
      contactPreference,
      parsedComplexity,
      scope,
      recurring,
      recurring ? recurringFrequency : null,
      certifications,
      materials,
      access,
      attachments,
      'open'
    ];

    const result = await query(insertQuery, values);
    const newRequest = result.rows[0];

    // Get category name for response
    const categoryQuery = 'SELECT name FROM categories WHERE id = $1';
    const categoryResult = await query(categoryQuery, [categoryId]);
    const categoryName = categoryResult.rows[0]?.name || 'Unknown';

    // Format response
    const formattedRequest = {
      id: newRequest.id,
      title: newRequest.title,
      description: newRequest.description,
      service: categoryName,
      subcategory: newRequest.subcategory,
      clientId: newRequest.client_id,
      status: newRequest.status,
      priority: newRequest.priority,
      urgency: newRequest.urgency,
      budget: {
        min: parseFloat(newRequest.budget_min) || 0,
        max: parseFloat(newRequest.budget_max) || 0,
        type: newRequest.budget_type,
        currency: newRequest.currency
      },
      location: {
        address: newRequest.location,
        details: newRequest.location_details,
        type: newRequest.location_type,
        coordinates: null // Will be calculated later if needed
      },
      scheduling: {
        preferredSchedule: newRequest.preferred_schedule,
        preferredStartDate: newRequest.preferred_start_date,
        preferredEndDate: newRequest.preferred_end_date,
        estimatedDuration: newRequest.estimated_duration,
        durationUnit: newRequest.duration_unit
      },
      projectDetails: {
        complexity: newRequest.complexity,
        scope: newRequest.scope,
        materials: newRequest.materials_provided_by,
        access: newRequest.access_type,
        isRecurring: newRequest.is_recurring,
        recurringFrequency: newRequest.recurring_frequency
      },
      requirements: {
        technical: newRequest.requirements,
        specialInstructions: newRequest.special_instructions,
        certifications: newRequest.required_certifications,
        contactPreference: newRequest.contact_preference
      },
      attachments: newRequest.attachments || [],
      createdAt: newRequest.created_at,
      updatedAt: newRequest.updated_at
    };

    res.status(201).json({
      success: true,
      data: formattedRequest,
      message: 'Request created successfully'
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
router.post('/:id/offers', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workerId, price, description, timeline, availability } = req.body;

    // Validate required fields
    if (!workerId || price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Worker ID and valid numeric price are required' });
    }

    // Check if request exists
    const requestCheck = await query('SELECT id FROM requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Resolve worker id (support demo IDs in development)
    const demoIds = ['worker1', 'client1', 'business1', 'admin1'];
    let actualWorkerId = workerId;
    if (demoIds.includes(workerId)) {
      // Pick a real worker UUID from DB to satisfy FK constraints
      const pickWorker = await query("SELECT id FROM users WHERE role = 'worker' AND status = 'active' ORDER BY rating DESC, jobs_completed DESC LIMIT 1");
      if (pickWorker.rows.length === 0) {
        return res.status(404).json({ error: 'No worker available in database' });
      }
      actualWorkerId = pickWorker.rows[0].id;
    } else {
      // Validate worker exists
      const workerCheck = await query('SELECT id FROM users WHERE id = $1 AND role = $2', [workerId, 'worker']);
      if (workerCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }
    }

    // Insert offer
    const result = await query(
      `INSERT INTO offers (request_id, worker_id, price, description, timeline, availability)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, request_id, worker_id, price, description, timeline, availability, status, created_at`,
      [id, actualWorkerId, Number(price), description, timeline, availability]
    );

    const offer = result.rows[0];

    // Create a real notification for the client (if request has client)
    try {
      const requestInfo = await query('SELECT client_id, title FROM requests WHERE id = $1', [id]);
      if (requestInfo.rows.length) {
        const { client_id: clientId, title } = requestInfo.rows[0];
        const notificationResult = await query(
          `INSERT INTO notifications (user_id, type, title, message, payload)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, type, title, message, payload, is_read, created_at`,
          [
            clientId,
            'offer.new',
            'Nouvelle offre reçue',
            `Vous avez reçu une nouvelle offre pour "${title}"`,
            JSON.stringify({ requestId: id, offerId: offer.id, price: offer.price, workerId: offer.worker_id })
          ]
        );

        // Emit real-time notification via WebSocket
        const io = (global as any).io;
        if (io) {
          io.to(`user_${clientId}`).emit('notification', {
            notification: notificationResult.rows[0]
          });
          console.log(`Real-time notification sent to user ${clientId}`);
        }
      }
    } catch (notifErr) {
      console.warn('Failed to insert notification:', notifErr);
    }
    // offer already defined above
    return res.status(201).json({ message: 'Offer submitted successfully', offer });
  } catch (error: any) {
    // Surface more helpful errors during development
    const pgCode = error?.code;
    if (pgCode === '23503') {
      // foreign_key_violation
      return res.status(404).json({ error: 'Related entity not found (request or worker)' });
    }
    if (pgCode === '22P02') {
      // invalid_text_representation (e.g., invalid UUID)
      return res.status(400).json({ error: 'Invalid UUID format for request or worker' });
    }
    console.error('Error creating offer:', { message: error?.message, code: error?.code, detail: error?.detail });
    return res.status(500).json({ error: 'Internal server error' });
  }
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
router.get('/:id/offers', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const requestCheck = await query('SELECT id FROM requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get offers with worker details
    const result = await query(`
      SELECT 
        o.id,
        o.request_id,
        o.worker_id,
        o.price,
        o.description,
        o.timeline,
        o.availability,
        o.status,
        o.created_at,
        u.first_name || ' ' || u.last_name as worker_name,
        u.rating as worker_rating,
        u.jobs_completed as worker_jobs_completed
      FROM offers o
      JOIN users u ON o.worker_id = u.id
      WHERE o.request_id = $1
      ORDER BY o.created_at ASC
    `, [id]);

    const offers = result.rows.map(offer => ({
      id: offer.id,
      requestId: offer.request_id,
      workerId: offer.worker_id,
      workerName: offer.worker_name,
      workerRating: offer.worker_rating,
      workerJobsCompleted: offer.worker_jobs_completed,
      price: parseFloat(offer.price),
      description: offer.description,
      timeline: offer.timeline,
      availability: offer.availability,
      status: offer.status,
      createdAt: offer.created_at
    }));

    return res.json({
      offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
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
router.put('/:requestId/offers/:offerId/status', async (req: Request, res: Response) => {
  try {
    const { requestId, offerId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be accepted or rejected' });
    }

    // Check if offer exists
    const offerCheck = await query('SELECT id, status FROM offers WHERE id = $1 AND request_id = $2', [offerId, requestId]);
    if (offerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const currentStatus = offerCheck.rows[0].status;
    if (currentStatus !== 'pending') {
      return res.status(400).json({ error: 'Offer status can only be updated when pending' });
    }

    // Update offer status
    const updateFields = ['status = $1'];
    const updateValues = [status];
    let paramCount = 1;

    if (status === 'accepted') {
      updateFields.push('accepted_at = CURRENT_TIMESTAMP');
      // If accepting, reject all other offers for this request
      await query('UPDATE offers SET status = $1, rejected_at = CURRENT_TIMESTAMP WHERE request_id = $2 AND id != $3 AND status = $4',
                  ['rejected', requestId, offerId, 'pending']);
    } else if (status === 'rejected') {
      updateFields.push('rejected_at = CURRENT_TIMESTAMP');
      if (rejectionReason) {
        paramCount++;
        updateFields.push(`rejection_reason = $${paramCount}`);
        updateValues.push(rejectionReason);
      }
    }

    updateValues.push(offerId);
    const result = await query(`
      UPDATE offers 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length}
      RETURNING id, request_id, worker_id, status, accepted_at, rejected_at, updated_at
    `, updateValues);

    const updatedOffer = result.rows[0];

    return res.json({
      message: 'Offer status updated successfully',
      offer: updatedOffer
    });
  } catch (error) {
    console.error('Error updating offer status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/requests/{requestId}/offers/{offerId}:
 *   put:
 *     summary: Update an offer
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
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               timeline:
 *                 type: string
 *               availability:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer updated successfully
 */
router.put('/:requestId/offers/:offerId', async (req: Request, res: Response) => {
  try {
    const { requestId, offerId } = req.params;
    const { price, description, timeline, availability } = req.body;
    const userId = (req.session as any)?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Validate required fields
    if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({ error: 'Price must be a valid number greater than 0' });
    }

    // Check if offer exists and belongs to the current user
    const offerCheck = await query(
      'SELECT id, worker_id, status FROM offers WHERE id = $1 AND request_id = $2',
      [offerId, requestId]
    );
    if (offerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const offer = offerCheck.rows[0];
    if (offer.worker_id !== userId) {
      return res.status(403).json({ error: 'You can only update your own offers' });
    }

    // Only allow updating pending offers
    if (offer.status !== 'pending') {
      return res.status(400).json({ error: 'Can only update pending offers' });
    }

    // Update offer
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (price !== undefined) {
      updateFields.push(`price = $${paramCount++}`);
      updateValues.push(Number(price));
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (timeline !== undefined) {
      updateFields.push(`timeline = $${paramCount++}`);
      updateValues.push(timeline);
    }
    if (availability !== undefined) {
      updateFields.push(`availability = $${paramCount++}`);
      updateValues.push(availability);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(offerId);

    const result = await query(
      `UPDATE offers SET ${updateFields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, request_id, worker_id, price, description, timeline, availability, status, created_at, updated_at`,
      updateValues
    );

    const updatedOffer = result.rows[0];

    return res.json({
      message: 'Offer updated successfully',
      offer: updatedOffer
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Update a service request
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [open, assigned, in_progress, completed, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *               budget_min:
 *                 type: number
 *               budget_max:
 *                 type: number
 *               workerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request updated successfully
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, budget_min, budget_max, workerId } = req.body;

    // Check if request exists
    const requestCheck = await query('SELECT id, client_id FROM requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      updateValues.push(priority);
    }
    if (budget_min !== undefined) {
      updateFields.push(`budget_min = $${paramCount++}`);
      updateValues.push(budget_min);
    }
    if (budget_max !== undefined) {
      updateFields.push(`budget_max = $${paramCount++}`);
      updateValues.push(budget_max);
    }
    if (workerId !== undefined) {
      updateFields.push(`assigned_worker_id = $${paramCount++}`);
      updateValues.push(workerId);
      // If assigning a worker, also set assigned_at
      if (status === 'assigned' || status === 'in_progress') {
        updateFields.push(`assigned_at = CURRENT_TIMESTAMP`);
      }
      if (status === 'in_progress') {
        updateFields.push(`started_at = CURRENT_TIMESTAMP`);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateValues.push(id);
    const result = await query(`
      UPDATE requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, status, priority, budget_min, budget_max, assigned_worker_id, created_at, updated_at
    `, updateValues);

    const updatedRequest = result.rows[0];

    return res.json({
      message: 'Request updated successfully',
      request: {
        id: updatedRequest.id,
        title: updatedRequest.title,
        description: updatedRequest.description,
        status: updatedRequest.status,
        priority: updatedRequest.priority,
        budget: updatedRequest.budget_min || updatedRequest.budget_max ? {
          min: updatedRequest.budget_min,
          max: updatedRequest.budget_max,
          currency: 'EUR'
        } : undefined,
        workerId: updatedRequest.assigned_worker_id,
        createdAt: updatedRequest.created_at,
        updatedAt: updatedRequest.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
