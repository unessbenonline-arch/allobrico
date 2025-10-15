import express from 'express';
import { query } from '../database';

const router = express.Router();

// Helper function to transform database user to API format
const transformUser = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  status: user.status,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  // Role-specific fields
  ...(user.role === 'client' && {
    address: user.address,
    preferences: user.preferences || [],
  }),
  ...(user.role === 'worker' && {
    specialty: user.specialty,
    rating: parseFloat(user.rating) || 0,
    jobs: user.jobs_completed || 0,
    workerStatus: user.worker_status,
    location: user.location,
    type: user.worker_type,
    urgent: user.accepts_urgent,
    hourlyRate: user.hourly_rate ? parseFloat(user.hourly_rate) : null,
    description: user.description,
    skills: user.skills || [],
    certifications: user.certifications || [],
    portfolioUrls: user.portfolio_urls || [],
  }),
});

// Helper function to transform database request to API format
const transformRequest = (request: any) => ({
  id: request.id,
  title: request.title,
  description: request.description,
  categoryId: request.category_id,
  clientId: request.client_id,
  assignedWorkerId: request.assigned_worker_id,
  status: request.status,
  priority: request.priority,
  budgetMin: request.budget_min ? parseFloat(request.budget_min) : null,
  budgetMax: request.budget_max ? parseFloat(request.budget_max) : null,
  finalBudget: request.final_budget ? parseFloat(request.final_budget) : null,
  location: request.location,
  locationDetails: request.location_details,
  preferredSchedule: request.preferred_schedule,
  attachments: request.attachments || [],
  requirements: request.requirements,
  assignedAt: request.assigned_at,
  startedAt: request.started_at,
  completedAt: request.completed_at,
  deadline: request.deadline,
  clientRating: request.client_rating,
  clientReview: request.client_review,
  workerRating: request.worker_rating,
  workerReview: request.worker_review,
  adminNotes: request.admin_notes,
  cancellationReason: request.cancellation_reason,
  createdAt: request.created_at,
  updatedAt: request.updated_at,
});

// Helper function to transform database report to API format
const transformReport = (report: any) => ({
  id: report.id,
  reporterId: report.reporter_id,
  reportedUserId: report.reported_user_id,
  reportedRequestId: report.reported_request_id,
  type: report.type,
  title: report.title,
  description: report.description,
  evidence: report.evidence || [],
  status: report.status,
  priority: report.priority,
  assignedAdminId: report.assigned_admin_id,
  resolution: report.resolution,
  resolutionActions: report.resolution_actions || [],
  createdAt: report.created_at,
  updatedAt: report.updated_at,
  resolvedAt: report.resolved_at,
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get user statistics
    const userStatsQuery = `
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'client' THEN 1 END) as total_clients,
        COUNT(CASE WHEN role = 'worker' THEN 1 END) as total_workers,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users
      FROM users
    `;
    const userStats = await query(userStatsQuery);

    // Get request statistics
    const requestStatsQuery = `
      SELECT
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_requests,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_requests
      FROM requests
    `;
    const requestStats = await query(requestStatsQuery);

    // Get report statistics
    const reportStatsQuery = `
      SELECT
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_reports
      FROM reports
    `;
    const reportStats = await query(reportStatsQuery);

    // Calculate revenue (mock for now - would come from payments table)
    const revenue = 45678;
    const monthlyRevenue = 12345;

    // Calculate satisfaction rate (mock for now - would come from ratings)
    const satisfactionRate = 94.2;

    const stats = {
      totalUsers: parseInt(userStats.rows[0].total_users),
      activeUsers: parseInt(userStats.rows[0].active_users),
      totalClients: parseInt(userStats.rows[0].total_clients),
      totalWorkers: parseInt(userStats.rows[0].total_workers),
      pendingUsers: parseInt(userStats.rows[0].pending_users),
      totalRequests: parseInt(requestStats.rows[0].total_requests),
      openRequests: parseInt(requestStats.rows[0].open_requests),
      assignedRequests: parseInt(requestStats.rows[0].assigned_requests),
      completedRequests: parseInt(requestStats.rows[0].completed_requests),
      urgentRequests: parseInt(requestStats.rows[0].urgent_requests),
      totalReports: parseInt(reportStats.rows[0].total_reports),
      pendingReports: parseInt(reportStats.rows[0].pending_reports),
      resolvedReports: parseInt(reportStats.rows[0].resolved_reports),
      highPriorityReports: parseInt(reportStats.rows[0].high_priority_reports),
      revenue,
      monthlyRevenue,
      satisfactionRate,
      transactions: parseInt(requestStats.rows[0].completed_requests) // Simplified
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * @swagger
 * /api/admin/pending-users:
 *   get:
 *     summary: Get pending user validations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, review, all]
 *           default: all
 *         description: Filter by validation status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [artisan, entreprise, all]
 *           default: all
 *         description: Filter by user type
 *     responses:
 *       200:
 *         description: List of pending users
 */
router.get('/pending-users', async (req, res) => {
  try {
    const { status = 'all', type = 'all' } = req.query as { status?: string; type?: string };

    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (status !== 'all') {
      whereConditions.push(`u.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (type !== 'all') {
      const typeMap: { [key: string]: string } = {
        'artisan': 'artisan',
        'entreprise': 'company'
      };
      whereConditions.push(`u.worker_type = $${paramIndex}`);
      params.push(typeMap[type]);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const queryText = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.worker_type,
        u.specialty,
        u.created_at,
        c.name as category_name,
        COUNT(d.id) as documents_count
      FROM users u
      LEFT JOIN categories c ON u.specialty = c.slug
      LEFT JOIN user_documents d ON u.id = d.user_id
      ${whereClause}
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.status, u.worker_type, u.specialty, u.created_at, c.name
      ORDER BY u.created_at DESC
    `;

    const result = await query(queryText, params);

    const transformedUsers = result.rows.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      type: user.worker_type === 'company' ? 'Entreprise' : 'Artisan',
      email: user.email,
      phone: user.phone,
      status: user.status,
      documents: parseInt(user.documents_count) || 0,
      createdAt: user.created_at.toISOString().split('T')[0],
      category: user.category_name || user.specialty,
      documentsList: [] // Would need a separate query to get actual documents
    }));

    res.json({
      data: transformedUsers,
      total: transformedUsers.length
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

/**
 * @swagger
 * /api/admin/pending-users/{id}:
 *   get:
 *     summary: Get detailed pending user information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Detailed user information
 *       404:
 *         description: User not found
 */
router.get('/pending-users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const queryText = `
      SELECT
        u.*,
        c.name as category_name
      FROM users u
      LEFT JOIN categories c ON u.specialty = c.slug
      WHERE u.id = $1
    `;

    const result = await query(queryText, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const transformedUser = {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      type: user.worker_type === 'company' ? 'Entreprise' : 'Artisan',
      email: user.email,
      phone: user.phone,
      status: user.status,
      documents: 0, // Would need to count actual documents
      createdAt: user.created_at.toISOString().split('T')[0],
      category: user.category_name || user.specialty,
      documentsList: [] // Would need a separate query
    };

    return res.json(transformedUser);
  } catch (error) {
    console.error('Error fetching pending user:', error);
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

/**
 * @swagger
 * /api/admin/pending-users/{id}/approve:
 *   post:
 *     summary: Approve a pending user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Approval notes
 *     responses:
 *       200:
 *         description: User approved successfully
 *       404:
 *         description: User not found
 */
router.post('/pending-users/:id/approve', async (req, res) => {
  try {
    const userId = req.params.id;
    const { notes } = req.body;

    const updateQuery = `
      UPDATE users
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `;

    const result = await query(updateQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or not pending' });
    }

    return res.json({
      message: 'User approved successfully',
      user: transformUser(result.rows[0]),
      notes
    });
  } catch (error) {
    console.error('Error approving user:', error);
    return res.status(500).json({ error: 'Failed to approve user' });
  }
});

/**
 * @swagger
 * /api/admin/pending-users/{id}/reject:
 *   post:
 *     summary: Reject a pending user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Rejection reason
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: User rejected successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 */
router.post('/pending-users/:id/reject', async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const updateQuery = `
      UPDATE users
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `;

    const result = await query(updateQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or not pending' });
    }

    return res.json({
      message: 'User rejected successfully',
      user: transformUser(result.rows[0]),
      reason,
      notes
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    return res.status(500).json({ error: 'Failed to reject user' });
  }
});

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, investigating, resolved, all]
 *           default: all
 *         description: Filter by report status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low, all]
 *           default: all
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/reports', async (req, res) => {
  try {
    const { status = 'all', priority = 'all' } = req.query as { status?: string; priority?: string };

    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (status !== 'all') {
      whereConditions.push(`r.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority !== 'all') {
      whereConditions.push(`r.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const queryText = `
      SELECT
        r.*,
        ru.first_name as reported_user_first_name,
        ru.last_name as reported_user_last_name,
        rr.title as reported_request_title
      FROM reports r
      LEFT JOIN users ru ON r.reported_user_id = ru.id
      LEFT JOIN requests rr ON r.reported_request_id = rr.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const result = await query(queryText, params);

    const transformedReports = result.rows.map(report => ({
      id: report.id,
      type: report.type,
      reporter: 'Anonymous', // Would need to join with reporter user
      reported: report.reported_user_first_name && report.reported_user_last_name
        ? `${report.reported_user_first_name} ${report.reported_user_last_name}`
        : report.reported_request_title || 'Unknown',
      description: report.description,
      status: report.status,
      priority: report.priority,
      createdAt: report.created_at.toISOString().split('T')[0],
      details: report.description,
      evidence: report.evidence || [],
      assignedTo: report.assigned_admin_id ? 'Admin' : null,
      resolution: report.resolution
    }));

    res.json({
      data: transformedReports,
      total: transformedReports.length
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   get:
 *     summary: Get detailed report information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Detailed report information
 *       404:
 *         description: Report not found
 */
router.get('/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;

    const queryText = `
      SELECT
        r.*,
        ru.first_name as reported_user_first_name,
        ru.last_name as reported_user_last_name,
        rr.title as reported_request_title
      FROM reports r
      LEFT JOIN users ru ON r.reported_user_id = ru.id
      LEFT JOIN requests rr ON r.reported_request_id = rr.id
      WHERE r.id = $1
    `;

    const result = await query(queryText, [reportId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = result.rows[0];
    const transformedReport = {
      id: report.id,
      type: report.type,
      reporter: 'Anonymous',
      reported: report.reported_user_first_name && report.reported_user_last_name
        ? `${report.reported_user_first_name} ${report.reported_user_last_name}`
        : report.reported_request_title || 'Unknown',
      description: report.description,
      status: report.status,
      priority: report.priority,
      createdAt: report.created_at.toISOString().split('T')[0],
      details: report.description,
      evidence: report.evidence || [],
      assignedTo: report.assigned_admin_id ? 'Admin' : null,
      resolution: report.resolution
    };

    return res.json(transformedReport);
  } catch (error) {
    console.error('Error fetching report:', error);
    return res.status(500).json({ error: 'Failed to fetch report details' });
  }
});

/**
 * @swagger
 * /api/admin/reports/{id}/status:
 *   put:
 *     summary: Update report status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, investigating, resolved]
 *               notes:
 *                 type: string
 *                 description: Status update notes
 *               resolution:
 *                 type: string
 *                 description: Resolution details (if resolved)
 *     responses:
 *       200:
 *         description: Report status updated successfully
 *       404:
 *         description: Report not found
 */
router.put('/reports/:id/status', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, notes, resolution } = req.body;

    if (!status || !['pending', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = {
      status,
      updated_at: new Date()
    };

    if (resolution) {
      updateData.resolution = resolution;
      updateData.resolved_at = new Date();
    }

    const updateQuery = `
      UPDATE reports
      SET status = $1, resolution = $2, resolved_at = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await query(updateQuery, [status, resolution || null, status === 'resolved' ? new Date() : null, reportId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({
      message: 'Report status updated successfully',
      report: transformReport(result.rows[0])
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return res.status(500).json({ error: 'Failed to update report status' });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [client, worker, admin, all]
 *           default: all
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, all]
 *           default: all
 *         description: Filter by user status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', async (req, res) => {
  try {
    const { role = 'all', status = 'all', search = '' } = req.query as { role?: string; status?: string; search?: string };

    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (role !== 'all') {
      whereConditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status !== 'all') {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const queryText = `
      SELECT
        id,
        first_name,
        last_name,
        email,
        role,
        status,
        worker_type,
        specialty,
        rating,
        jobs_completed,
        created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await query(queryText, params);

    const transformedUsers = result.rows.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      status: user.status,
      type: user.worker_type === 'company' ? 'entreprise' : 'artisan',
      specialty: user.specialty,
      rating: parseFloat(user.rating) || 0,
      jobs: user.jobs_completed || 0,
      createdAt: user.created_at.toISOString().split('T')[0]
    }));

    res.json({
      data: transformedUsers,
      total: transformedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               reason:
 *                 type: string
 *                 description: Reason for status change
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 */
router.put('/users/:id/status', async (req, res) => {
  try {
    const userId = req.params.id;
    const { status, reason } = req.body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateQuery = `
      UPDATE users
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [status, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'User status updated successfully',
      user: transformUser(result.rows[0]),
      reason
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get user growth data
    const userGrowthQuery = `
      SELECT
        DATE_TRUNC('${period}', created_at) as period,
        COUNT(*) as count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 ${period}s'
      GROUP BY DATE_TRUNC('${period}', created_at)
      ORDER BY period
    `;

    // Get request stats
    const requestStatsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status IN ('open', 'assigned', 'in_progress') THEN 1 END) as active
      FROM requests
    `;

    // Get revenue data (simplified - would need payments table)
    const revenueQuery = `
      SELECT
        COALESCE(SUM(final_budget), 0) as total_revenue,
        COALESCE(AVG(final_budget), 0) as average_budget
      FROM requests
      WHERE status = 'completed'
    `;

    // Get top services
    const topServicesQuery = `
      SELECT
        c.name,
        COUNT(r.id) as count,
        ROUND(COUNT(r.id) * 100.0 / SUM(COUNT(r.id)) OVER (), 1) as percentage
      FROM requests r
      JOIN categories c ON r.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 5
    `;

    // Get user types distribution
    const userTypesQuery = `
      SELECT
        CASE
          WHEN role = 'client' THEN 'Clients'
          WHEN role = 'worker' THEN 'Artisans'
          ELSE 'Admins'
        END as type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM users
      GROUP BY role
    `;

    const [userGrowth, requestStats, revenue, topServices, userTypes] = await Promise.all([
      query(userGrowthQuery),
      query(requestStatsQuery),
      query(revenueQuery),
      query(topServicesQuery),
      query(userTypesQuery)
    ]);

    const analyticsData = {
      period,
      userGrowth: {
        labels: userGrowth.rows.map(row => row.period.toISOString().split('T')[0]),
        data: userGrowth.rows.map(row => parseInt(row.count))
      },
      transactionVolume: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        data: [45000, 52000, 48000, 61000, 55000, 67000] // Mock data for now
      },
      requestStats: {
        total: parseInt(requestStats.rows[0].total),
        completed: parseInt(requestStats.rows[0].completed),
        cancelled: parseInt(requestStats.rows[0].cancelled),
        active: parseInt(requestStats.rows[0].active)
      },
      revenue: {
        total: parseFloat(revenue.rows[0].total_revenue),
        monthly: parseFloat(revenue.rows[0].total_revenue) / 12, // Simplified
        average: parseFloat(revenue.rows[0].average_budget)
      },
      topServices: topServices.rows.map(row => ({
        name: row.name,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      })),
      userTypes: userTypes.rows.map(row => ({
        type: row.type,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      }))
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get admin settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin settings
 */
router.get('/settings', async (req, res) => {
  try {
    const queryText = `
      SELECT category, key, value
      FROM platform_settings
      ORDER BY category, key
    `;

    const result = await query(queryText);

    // Transform flat results into nested object
    const settings: any = {};
    result.rows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      // Parse JSON value if it's stored as JSON
      settings[row.category][row.key] = row.value;
    });

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update admin settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: object
 *               moderation:
 *                 type: object
 *               notifications:
 *                 type: object
 *               security:
 *                 type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/settings', async (req, res) => {
  try {
    const { platform, moderation, notifications, security } = req.body;

    // Update settings for each category
    const categories = { platform, moderation, notifications, security };
    const updates: Promise<any>[] = [];

    Object.entries(categories).forEach(([category, settings]) => {
      if (settings && typeof settings === 'object') {
        Object.entries(settings).forEach(([key, value]) => {
          const updateQuery = `
            INSERT INTO platform_settings (category, key, value, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (category, key)
            DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
          `;
          updates.push(query(updateQuery, [category, key, value]));
        });
      }
    });

    await Promise.all(updates);

    res.json({
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * @swagger
 * /api/admin/requests:
 *   get:
 *     summary: Get all service requests for admin
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, assigned, in_progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of requests retrieved successfully
 */
router.get('/requests', async (req, res) => {
  try {
    const { status, priority, service } = req.query;

    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`r.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      whereConditions.push(`r.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (service) {
      whereConditions.push(`c.name ILIKE $${paramIndex}`);
      params.push(`%${service}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const queryText = `
      SELECT
        r.*,
        c.name as category_name,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        w.first_name as worker_first_name,
        w.last_name as worker_last_name
      FROM requests r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.client_id = u.id
      LEFT JOIN users w ON r.assigned_worker_id = w.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const result = await query(queryText, params);

    const transformedRequests = result.rows.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      service: request.category_name,
      client: `${request.client_first_name} ${request.client_last_name}`,
      clientId: request.client_id,
      status: request.status,
      priority: request.priority,
      budget: {
        min: request.budget_min ? parseFloat(request.budget_min) : null,
        max: request.budget_max ? parseFloat(request.budget_max) : null,
        currency: 'EUR'
      },
      location: request.location,
      createdAt: request.created_at.toISOString().split('T')[0],
      urgent: request.priority === 'urgent',
      assignedWorker: request.worker_first_name ? `${request.worker_first_name} ${request.worker_last_name}` : null,
      adminNotes: request.admin_notes || '',
      assignmentNotes: '' // Would need separate table for assignment notes
    }));

    res.json({
      data: transformedRequests,
      total: transformedRequests.length
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/**
 * @swagger
 * /api/admin/requests/{id}:
 *   get:
 *     summary: Get request details by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request details retrieved successfully
 *       404:
 *         description: Request not found
 */
router.get('/requests/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    const queryText = `
      SELECT
        r.*,
        c.name as category_name,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        w.first_name as worker_first_name,
        w.last_name as worker_last_name
      FROM requests r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.client_id = u.id
      LEFT JOIN users w ON r.assigned_worker_id = w.id
      WHERE r.id = $1
    `;

    const result = await query(queryText, [requestId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = result.rows[0];
    const transformedRequest = {
      id: request.id,
      title: request.title,
      description: request.description,
      service: request.category_name,
      client: `${request.client_first_name} ${request.client_last_name}`,
      clientId: request.client_id,
      status: request.status,
      priority: request.priority,
      budget: {
        min: request.budget_min ? parseFloat(request.budget_min) : null,
        max: request.budget_max ? parseFloat(request.budget_max) : null,
        currency: 'EUR'
      },
      location: request.location,
      createdAt: request.created_at.toISOString().split('T')[0],
      urgent: request.priority === 'urgent',
      assignedWorker: request.worker_first_name ? `${request.worker_first_name} ${request.worker_last_name}` : null,
      adminNotes: request.admin_notes || '',
      assignmentNotes: ''
    };

    return res.json(transformedRequest);
  } catch (error) {
    console.error('Error fetching request:', error);
    return res.status(500).json({ error: 'Failed to fetch request details' });
  }
});

/**
 * @swagger
 * /api/admin/requests/{id}/status:
 *   put:
 *     summary: Update request status
 *     tags: [Admin]
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
 *               status:
 *                 type: string
 *                 enum: [open, assigned, in_progress, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request status updated successfully
 */
router.put('/requests/:id/status', async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, notes } = req.body;

    if (!status || !['open', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateFields = ['status = $1'];
    const params: any[] = [status];
    let paramIndex = 2;

    if (notes) {
      updateFields.push(`admin_notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    // Set timestamps based on status
    if (status === 'assigned') {
      updateFields.push('assigned_at = CURRENT_TIMESTAMP');
    } else if (status === 'in_progress') {
      updateFields.push('started_at = CURRENT_TIMESTAMP');
    } else if (status === 'completed') {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }

    params.push(requestId);

    const updateQuery = `
      UPDATE requests
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    return res.json({
      message: 'Request status updated successfully',
      request: transformRequest(result.rows[0])
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return res.status(500).json({ error: 'Failed to update request status' });
  }
});

/**
 * @swagger
 * /api/admin/requests/{id}/assign:
 *   put:
 *     summary: Assign request to worker
 *     tags: [Admin]
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request assigned successfully
 */
router.put('/requests/:id/assign', async (req, res) => {
  try {
    const requestId = req.params.id;
    const { workerId, notes } = req.body;

    if (!workerId) {
      return res.status(400).json({ error: 'Worker ID is required' });
    }

    const updateQuery = `
      UPDATE requests
      SET assigned_worker_id = $1, status = 'assigned', assigned_at = CURRENT_TIMESTAMP,
          admin_notes = COALESCE(admin_notes, '') || $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateQuery, [workerId, notes ? `\nAssignment notes: ${notes}` : '', requestId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    return res.json({
      message: 'Request assigned successfully',
      request: transformRequest(result.rows[0])
    });
  } catch (error) {
    console.error('Error assigning request:', error);
    return res.status(500).json({ error: 'Failed to assign request' });
  }
});

export default router;