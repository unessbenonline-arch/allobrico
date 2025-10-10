import express from 'express';

const router = express.Router();

// Mock data for admin functionality
let pendingUsers = [
  {
    id: 1,
    name: 'Martin Electricité SARL',
    type: 'Entreprise',
    email: 'contact@martin-elec.fr',
    phone: '01 45 67 89 12',
    status: 'pending',
    documents: 4,
    createdAt: '2024-03-15',
    category: 'Électricité',
    documentsList: [
      { id: 1, name: 'Kbis', status: 'verified', url: '/docs/kbis.pdf' },
      { id: 2, name: 'Assurance décennale', status: 'verified', url: '/docs/assurance.pdf' },
      { id: 3, name: 'Diplôme électricien', status: 'pending', url: '/docs/diplome.pdf' },
      { id: 4, name: 'Certificat de qualification', status: 'verified', url: '/docs/certificat.pdf' }
    ]
  },
  {
    id: 2,
    name: 'Pierre Dubois',
    type: 'Artisan',
    email: 'pierre.dubois@email.fr',
    phone: '06 12 34 56 78',
    status: 'pending',
    documents: 3,
    createdAt: '2024-03-14',
    category: 'Plomberie',
    documentsList: [
      { id: 1, name: 'Carte d\'identité', status: 'verified', url: '/docs/id.pdf' },
      { id: 2, name: 'Diplôme plombier', status: 'pending', url: '/docs/diplome.pdf' },
      { id: 3, name: 'Assurance responsabilité', status: 'verified', url: '/docs/assurance.pdf' }
    ]
  },
  {
    id: 3,
    name: 'Sophie Laurent',
    type: 'Artisan',
    email: 's.laurent@email.fr',
    phone: '07 98 76 54 32',
    status: 'review',
    documents: 5,
    createdAt: '2024-03-13',
    category: 'Peinture',
    documentsList: [
      { id: 1, name: 'Carte d\'identité', status: 'verified', url: '/docs/id.pdf' },
      { id: 2, name: 'Diplôme peintre', status: 'verified', url: '/docs/diplome.pdf' },
      { id: 3, name: 'Portfolio travaux', status: 'pending', url: '/docs/portfolio.pdf' },
      { id: 4, name: 'Assurance responsabilité', status: 'verified', url: '/docs/assurance.pdf' },
      { id: 5, name: 'Certificat de qualification', status: 'pending', url: '/docs/certificat.pdf' }
    ]
  }
];

let reports = [
  {
    id: 1,
    type: 'Qualité service',
    reporter: 'Client Marie L.',
    reported: 'Jean Martin (Plombier)',
    description: 'Travail non terminé, abandonnné en cours',
    status: 'investigating',
    priority: 'high',
    createdAt: '2024-03-16',
    details: 'Le client signale que le plombier a commencé les travaux mais les a abandonnés après avoir été payé d\'avance. Le client demande un remboursement.',
    evidence: ['photo1.jpg', 'facture.pdf'],
    assignedTo: 'Admin1'
  },
  {
    id: 2,
    type: 'Facturation',
    reporter: 'Client Thomas R.',
    reported: 'ElectricPro SARL',
    description: 'Facture supérieure au devis initial',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-03-15',
    details: 'Le devis initial était de 1200€ mais la facture finale s\'élève à 1800€. L\'entreprise explique le dépassement par des travaux supplémentaires non prévus.',
    evidence: ['devis.pdf', 'facture.pdf'],
    assignedTo: 'Admin2',
    resolution: 'Remboursement partiel accordé de 300€'
  },
  {
    id: 3,
    type: 'Comportement',
    reporter: 'Artisan Sophie D.',
    reported: 'Client Paul M.',
    description: 'Propos inappropriés et menaçants',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-03-14',
    details: 'L\'artisan signale que le client a tenu des propos inappropriés et menaçants lors d\'un rendez-vous. L\'artisan craint pour sa sécurité.',
    evidence: ['message_screenshot.jpg'],
    assignedTo: null
  }
];

let adminStats = {
  totalUsers: 2847,
  activeUsers: 2847,
  transactions: 1234,
  reports: 23,
  satisfactionRate: 94.2,
  validationsToday: 12,
  reportsResolved: 8,
  accountsSuspended: 3,
  avgProcessingTime: '2.3h'
};

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
router.get('/stats', (req, res) => {
  res.json(adminStats);
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
router.get('/pending-users', (req, res) => {
  const { status = 'all', type = 'all' } = req.query as { status?: string; type?: string };

  let filtered = pendingUsers;

  if (status !== 'all') {
    filtered = filtered.filter(user => user.status === status);
  }

  if (type !== 'all') {
    const typeMap: { [key: string]: string } = {
      'artisan': 'Artisan',
      'entreprise': 'Entreprise'
    };
    filtered = filtered.filter(user => user.type === typeMap[type]);
  }

  res.json({
    data: filtered,
    total: filtered.length
  });
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
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Detailed user information
 *       404:
 *         description: User not found
 */
router.get('/pending-users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = pendingUsers.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
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
 *           type: integer
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
router.post('/pending-users/:id/approve', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = pendingUsers.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { notes } = req.body;

  // Remove from pending users (simulating approval)
  const approvedUser = pendingUsers.splice(userIndex, 1)[0];

  // Update stats
  adminStats.validationsToday += 1;

  return res.json({
    message: 'User approved successfully',
    user: approvedUser,
    notes
  });
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
 *           type: integer
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
router.post('/pending-users/:id/reject', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = pendingUsers.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { reason, notes } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  // Remove from pending users (simulating rejection)
  const rejectedUser = pendingUsers.splice(userIndex, 1)[0];

  return res.json({
    message: 'User rejected successfully',
    user: rejectedUser,
    reason,
    notes
  });
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
router.get('/reports', (req, res) => {
  const { status = 'all', priority = 'all' } = req.query;

  let filtered = reports;

  if (status !== 'all') {
    filtered = filtered.filter(report => report.status === status);
  }

  if (priority !== 'all') {
    filtered = filtered.filter(report => report.priority === priority);
  }

  res.json({
    data: filtered,
    total: filtered.length
  });
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
 *           type: integer
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Detailed report information
 *       404:
 *         description: Report not found
 */
router.get('/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const report = reports.find(r => r.id === reportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  return res.json(report);
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
 *           type: integer
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
router.put('/reports/:id/status', (req, res) => {
  const reportId = parseInt(req.params.id);
  const reportIndex = reports.findIndex(r => r.id === reportId);

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const { status, notes, resolution } = req.body;

  if (!status || !['pending', 'investigating', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  reports[reportIndex] = {
    ...reports[reportIndex],
    status,
    ...(notes && { notes }),
    ...(resolution && { resolution })
  };

  // Update stats if resolved
  if (status === 'resolved') {
    adminStats.reportsResolved += 1;
    adminStats.reports -= 1;
  }

  return res.json({
    message: 'Report status updated successfully',
    report: reports[reportIndex]
  });
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
router.get('/users', (req, res) => {
  const { role = 'all', status = 'all', search = '' } = req.query as { role?: string; status?: string; search?: string };

  // Mock users data
  const allUsers = [
    {
      id: 1,
      name: 'Jean Martin',
      email: 'jean.martin@email.fr',
      role: 'worker',
      status: 'active',
      type: 'artisan',
      specialty: 'Plomberie',
      rating: 4.5,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Marie Dupont',
      email: 'marie.dupont@email.fr',
      role: 'client',
      status: 'active',
      preferences: ['Plomberie', 'Électricité'],
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'ElectricPro SARL',
      email: 'contact@electricpro.fr',
      role: 'worker',
      status: 'suspended',
      type: 'entreprise',
      specialty: 'Électricité',
      rating: 3.8,
      createdAt: '2024-01-10'
    }
  ];

  let filtered = allUsers;

  if (role !== 'all') {
    filtered = filtered.filter(user => user.role === role);
  }

  if (status !== 'all') {
    filtered = filtered.filter(user => user.status === status);
  }

  if (search) {
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    data: filtered,
    total: filtered.length
  });
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
 *           type: integer
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
router.put('/users/:id/status', (req, res) => {
  const userId = parseInt(req.params.id);
  const { status, reason } = req.body;

  if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Mock user update
  const mockUser = {
    id: userId,
    name: 'Updated User',
    email: 'user@email.com',
    status: status,
    updatedAt: new Date().toISOString()
  };

  // Update stats
  if (status === 'suspended') {
    adminStats.accountsSuspended += 1;
  }

  return res.json({
    message: 'User status updated successfully',
    user: mockUser,
    reason
  });
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
router.get('/analytics', (req, res) => {
  const { period = 'month' } = req.query;

  const analyticsData = {
    period,
    userGrowth: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      data: [1200, 1350, 1480, 1620, 1780, 1950]
    },
    transactionVolume: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      data: [45000, 52000, 48000, 61000, 55000, 67000]
    },
    categoryDistribution: [
      { category: 'Plomberie', count: 245, percentage: 28 },
      { category: 'Électricité', count: 198, percentage: 23 },
      { category: 'Peinture', count: 156, percentage: 18 },
      { category: 'Jardinage', count: 134, percentage: 15 },
      { category: 'Autre', count: 107, percentage: 12 }
    ],
    topWorkers: [
      { name: 'Jean Martin', specialty: 'Plomberie', rating: 4.8, jobs: 47 },
      { name: 'Marie Dubois', specialty: 'Électricité', rating: 4.7, jobs: 42 },
      { name: 'Pierre Leroy', specialty: 'Peinture', rating: 4.6, jobs: 38 }
    ]
  };

  res.json(analyticsData);
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
router.get('/settings', (req, res) => {
  const settings = {
    platform: {
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    },
    moderation: {
      autoApproveWorkers: false,
      maxReportsPerUser: 5,
      suspensionThreshold: 3
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true
    },
    security: {
      twoFactorRequired: false,
      passwordMinLength: 8,
      sessionTimeout: 24 // hours
    }
  };

  res.json(settings);
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
router.put('/settings', (req, res) => {
  const { platform, moderation, notifications, security } = req.body;

  // Mock settings update
  const updatedSettings = {
    platform: platform || {},
    moderation: moderation || {},
    notifications: notifications || {},
    security: security || {},
    updatedAt: new Date().toISOString()
  };

  res.json({
    message: 'Settings updated successfully',
    settings: updatedSettings
  });
});

export default router;