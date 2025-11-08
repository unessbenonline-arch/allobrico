import React from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Filter,
  Search,
  MessageSquare,
  FileText,
  BarChart3,
  UserCheck,
  ClipboardList,
  Flag,
  Database,
  Star,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  CircularProgress,
  Switch,
  FormControlLabel,
  Grid,
  IconButton,
  Badge,
} from '@mui/material';
import { adminService } from '../utils';
import { formatDate } from '../utils';

interface AdminDashboardProps {
  userProfile: any;
  notifications: Array<any>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userProfile,
  notifications,
}) => {
  // State management
  const [stats, setStats] = React.useState<any>(null);
  const [pendingUsers, setPendingUsers] = React.useState<any[]>([]);
  const [reports, setReports] = React.useState<any[]>([]);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [settings, setSettings] = React.useState<any>(null);
  const [settingsChanged, setSettingsChanged] = React.useState(false);

  // UI state
  const [loading, setLoading] = React.useState(true);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [loadingRequests, setLoadingRequests] = React.useState(false);
  const [loadingReports, setLoadingReports] = React.useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(false);
  const [loadingSettings, setLoadingSettings] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);
  const [showUserModal, setShowUserModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = React.useState(false);
  const [editingRequest, setEditingRequest] = React.useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showUserManagement, setShowUserManagement] = React.useState(false);
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = React.useState(false);
  const [availableWorkers, setAvailableWorkers] = React.useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = React.useState(false);

  // Form states
  const [userAction, setUserAction] = React.useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [approvalNotes, setApprovalNotes] = React.useState('');
  const [reportStatus, setReportStatus] = React.useState('');
  const [reportNotes, setReportNotes] = React.useState('');
  const [reportResolution, setReportResolution] = React.useState('');

  // Assignment state
  const [assignmentNotes, setAssignmentNotes] = React.useState('');
  const [selectedWorker, setSelectedWorker] = React.useState<any>(null);

  // Notification state
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Filters
  const [userFilters, setUserFilters] = React.useState({ status: 'all', type: 'all' });
  const [reportFilters, setReportFilters] = React.useState({ status: 'all', priority: 'all' });
  const [requestFilters, setRequestFilters] = React.useState({ status: 'all', priority: 'all', service: 'all' });
  const [userSearch, setUserSearch] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  // Load initial data
  React.useEffect(() => {
    loadDashboardData();
  }, []);

  // Load users when filters change
  React.useEffect(() => {
    if (activeTab === 1) {
      loadUsers();
    }
  }, [activeTab, userFilters, userSearch]);

  // Load requests when filters change
  React.useEffect(() => {
    if (activeTab === 2) {
      loadRequests();
    }
  }, [activeTab, requestFilters]);

  // Load reports when filters change
  React.useEffect(() => {
    if (activeTab === 3) {
      loadReports();
    }
  }, [activeTab, reportFilters]);

  // Load analytics when tab is active
  React.useEffect(() => {
    if (activeTab === 4) {
      loadAnalytics();
    }
  }, [activeTab]);

  // Load settings when tab is active
  React.useEffect(() => {
    if (activeTab === 5) {
      loadSettings();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await adminService.getSettings();
      setSettings(response as any);
    } catch (error) {
      console.error('Error loading settings:', error);
      showSnackbar('Erreur lors du chargement des paramètres', 'error');
      // Keep default settings if loading fails
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingUsersData, reportsData, requestsData] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingUsers(),
        adminService.getReports(),
        adminService.getRequests()
      ]);

      setStats(statsData as any);
      setPendingUsers((pendingUsersData as any).data || []);
      setReports((reportsData as any).data || []);
      setRequests((requestsData as any).data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const params: any = {};
      if (userFilters.status !== 'all') params.status = userFilters.status;
      if (userFilters.type !== 'all') params.role = userFilters.type;
      if (userSearch) params.search = userSearch;

      const response = await adminService.getUsers(params);
      setAllUsers((response as any).data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erreur lors du chargement des utilisateurs';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const params: any = {};
      if (requestFilters.status !== 'all') params.status = requestFilters.status;
      if (requestFilters.priority !== 'all') params.priority = requestFilters.priority;
      if (requestFilters.service !== 'all') params.service = requestFilters.service;

      const response = await adminService.getRequests(params);
      setRequests((response as any).data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      showSnackbar('Erreur lors du chargement des demandes', 'error');
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      const params: any = {};
      if (reportFilters.status !== 'all') params.status = reportFilters.status;
      if (reportFilters.priority !== 'all') params.priority = reportFilters.priority;

      const response = await adminService.getReports(params);
      setReports((response as any).data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      showSnackbar('Erreur lors du chargement des signalements', 'error');
    } finally {
      setLoadingReports(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await adminService.getAnalytics();
      // Ensure the response has the expected structure
      if (response && typeof response === 'object') {
        setAnalytics(response as any);
      } else {
        console.warn('Analytics response is not in expected format:', response);
        setAnalytics(null); // This will use mock data
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      showSnackbar('Erreur lors du chargement des analyses', 'error');
      setAnalytics(null); // This will use mock data
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await adminService.updateSettings(settings);
      showSnackbar('Paramètres sauvegardés avec succès', 'success');
      setSettingsChanged(false);
      // Reload settings to ensure we have the latest data
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // User validation handlers
  const handleExamineUser = async (user: any) => {
    try {
      const userDetails = await adminService.getPendingUserById(user.id);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des détails utilisateur', 'error');
    }
  };

  const handleApproveUser = async () => {
    if (!selectedUser) return;

    try {
      await adminService.approveUser(selectedUser.id, approvalNotes);
      showSnackbar('Utilisateur approuvé avec succès', 'success');
      setShowUserModal(false);
      setSelectedUser(null);
      setApprovalNotes('');
      // Reload pending users
      const pendingUsersData = await adminService.getPendingUsers();
      setPendingUsers((pendingUsersData as any).data || []);
    } catch (error) {
      showSnackbar('Erreur lors de l\'approbation', 'error');
    }
  };

  const handleRejectUser = async () => {
    if (!selectedUser || !rejectionReason) return;

    try {
      await adminService.rejectUser(selectedUser.id, rejectionReason);
      showSnackbar('Utilisateur rejeté', 'success');
      setShowUserModal(false);
      setSelectedUser(null);
      setRejectionReason('');
      // Reload pending users
      const pendingUsersData = await adminService.getPendingUsers();
      setPendingUsers((pendingUsersData as any).data || []);
    } catch (error) {
      showSnackbar('Erreur lors du rejet', 'error');
    }
  };

  // Report handlers
  const handleViewReport = async (report: any) => {
    try {
      const reportDetails = await adminService.getReportById(report.id);
      setSelectedReport(reportDetails);
      setReportStatus((reportDetails as any).status);
      setReportNotes('');
      setReportResolution('');
      setShowReportModal(true);
    } catch (error) {
      showSnackbar('Erreur lors du chargement du signalement', 'error');
    }
  };

  const handleUpdateReportStatus = async () => {
    if (!selectedReport) return;

    try {
      await adminService.updateReportStatus(
        selectedReport.id,
        reportStatus,
        reportNotes,
        reportResolution
      );
      showSnackbar('Statut du signalement mis à jour', 'success');
      setShowReportModal(false);
      setSelectedReport(null);
      // Reload reports
      const reportsData = await adminService.getReports();
      setReports((reportsData as any).data || []);
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour', 'error');
    }
  };

  // Request handlers
  const handleViewRequest = async (request: any) => {
    try {
      const requestDetails = await adminService.getRequestById(request.id);
      setSelectedRequest(requestDetails);
      setShowRequestModal(true);
    } catch (error) {
      showSnackbar('Erreur lors du chargement de la demande', 'error');
    }
  };

  const handleUpdateRequestStatus = async (requestId: number, newStatus: string, notes?: string) => {
    try {
      await adminService.updateRequestStatus(requestId, newStatus, notes);
      showSnackbar('Statut de la demande mis à jour', 'success');
      // Reload requests
      const requestsData = await adminService.getRequests();
      setRequests((requestsData as any).data || []);
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleAssignRequest = async (requestId: number, workerId: number, notes?: string) => {
    try {
      await adminService.assignRequest(requestId, workerId, notes);
      showSnackbar('Demande assignée avec succès', 'success');
      // Reload requests
      const requestsData = await adminService.getRequests();
      setRequests((requestsData as any).data || []);
      setShowAssignmentModal(false);
      setSelectedWorker(null);
      setAssignmentNotes('');
    } catch (error) {
      showSnackbar('Erreur lors de l\'assignation', 'error');
    }
  };

  const handleEditRequest = (request: any) => {
    setEditingRequest({ ...request });
    setShowEditRequestModal(true);
  };

  const handleUpdateRequest = async () => {
    try {
      await adminService.updateRequest(editingRequest.id, editingRequest);
      showSnackbar('Demande mise à jour avec succès', 'success');
      setShowEditRequestModal(false);
      setEditingRequest(null);
      // Reload requests
      const requestsData = await adminService.getRequests();
      setRequests((requestsData as any).data || []);
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour de la demande', 'error');
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.')) {
      try {
        await adminService.deleteRequest(requestId);
        showSnackbar('Demande supprimée avec succès', 'success');
        // Reload requests
        const requestsData = await adminService.getRequests();
        setRequests((requestsData as any).data || []);
      } catch (error) {
        showSnackbar('Erreur lors de la suppression de la demande', 'error');
      }
    }
  };

  const loadAvailableWorkers = async (request?: any) => {
    try {
      setLoadingWorkers(true);
      // Get all workers and filter by availability
      const workersData = await adminService.getUsers({ role: 'worker', status: 'active' });
      let availableWorkers = (workersData as any).data || [];

      console.log('Total workers fetched:', availableWorkers.length);
      console.log('Request location:', request?.location);

      // For now, show all active workers regardless of location
      // Location filtering can be added back with better logic later
      availableWorkers = availableWorkers.filter((worker: any) =>
        worker.workerStatus === 'available' || worker.workerStatus === 'busy'
      );

      console.log('Final available workers after status filter:', availableWorkers.length);
      setAvailableWorkers(availableWorkers);
    } catch (error) {
      console.error('Error loading available workers:', error);
      showSnackbar('Erreur lors du chargement des artisans', 'error');
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleOpenAssignmentModal = async (request: any) => {
    setSelectedRequest(request);
    await loadAvailableWorkers(request);
    setShowAssignmentModal(true);
  };

  // Navigation handlers
  const handleSettings = () => {
    setActiveTab(5);
  };

  const handleAnalytics = () => {
    setActiveTab(4);
  };

  // Mock data for display
  const mockStats = [
    {
      label: 'Utilisateurs actifs',
      value: '1,247',
      change: '+12% ce mois',
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Transactions',
      value: '€45,231',
      change: '+8% ce mois',
      icon: DollarSign,
      color: 'text-success',
    },
    {
      label: 'Signalements',
      value: '23',
      change: '5 résolus',
      icon: AlertTriangle,
      color: 'text-warning',
    },
    {
      label: 'Taux satisfaction',
      value: '94%',
      change: '+2.1% ce mois',
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  const mockPendingUsers = [
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
    },
  ];

  const mockReports = [
    {
      id: 1,
      type: 'Qualité service',
      reporter: 'Client Marie L.',
      reported: 'Jean Martin (Plombier)',
      description: 'Travail non terminé, abandonnné en cours',
      status: 'investigating',
      priority: 'high',
      createdAt: '2024-03-16',
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
    },
  ];

  // Transform API stats into display format
  const transformStatsToDisplay = (apiStats: any) => {
    if (!apiStats) return mockStats;

    return [
      {
        label: 'Utilisateurs actifs',
        value: apiStats.totalUsers?.toLocaleString() || '0',
        change: `+${apiStats.activeUsers || 0} actifs`,
        icon: Users,
        color: 'text-primary',
      },
      {
        label: 'Transactions',
        value: apiStats.transactions?.toLocaleString() || '0',
        change: `${apiStats.transactions || 0} ce mois`,
        icon: DollarSign,
        color: 'text-success',
      },
      {
        label: 'Signalements',
        value: apiStats.reports?.toString() || '0',
        change: `${apiStats.reportsResolved || 0} résolus`,
        icon: AlertTriangle,
        color: 'text-warning',
      },
      {
        label: 'Taux satisfaction',
        value: `${apiStats.satisfactionRate || 0}%`,
        change: '+2.1% ce mois',
        icon: TrendingUp,
        color: 'text-success',
      },
    ];
  };

  // Use API data if available, otherwise fall back to mock data
  const displayStats = stats ? transformStatsToDisplay(stats) : mockStats;
  const displayPendingUsers = pendingUsers.length > 0 ? pendingUsers : mockPendingUsers;
  const displayReports = reports.length > 0 ? reports : mockReports;

  // Render functions for tabs
  const renderDashboardTab = () => (
    <Box>
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {displayStats.map((stat: any, index: number) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Box sx={{ color: 'primary.main' }}>
                    <stat.icon size={32} />
                  </Box>
                  <TrendingUp size={20} style={{ opacity: 0.6 }} />
                </Stack>
                <Typography variant="h4" fontWeight={800}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="caption" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserCheck size={20} /> Validations en attente
              </Typography>
              <Typography variant="h3" color="warning.main" sx={{ mb: 2 }}>
                {displayPendingUsers.length}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setActiveTab(1)}
                startIcon={<Eye size={16} />}
              >
                Voir les validations
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClipboardList size={20} /> Demandes actives
              </Typography>
              <Typography variant="h3" color="primary.main" sx={{ mb: 2 }}>
                {requests.filter(r => r.status === 'open' || r.status === 'assigned').length}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setActiveTab(2)}
                startIcon={<FileText size={16} />}
              >
                Gérer les demandes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flag size={20} /> Signalements
              </Typography>
              <Typography variant="h3" color="error.main" sx={{ mb: 2 }}>
                {displayReports.filter(r => r.status === 'pending').length}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() => setActiveTab(3)}
                startIcon={<AlertTriangle size={16} />}
              >
                Traiter les signalements
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderUsersTab = () => {
    const handleUserStatusChange = async (userId: number, newStatus: string) => {
      try {
        await adminService.updateUserStatus(userId, newStatus);
        showSnackbar('Statut utilisateur mis à jour', 'success');
        loadUsers();
      } catch (error) {
        showSnackbar('Erreur lors de la mise à jour', 'error');
      }
    };

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Gestion des utilisateurs
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Rechercher..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Button
              variant="outlined"
              startIcon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtres
            </Button>
          </Stack>
        </Stack>

        {showFilters && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={userFilters.status}
                  onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value })}
                >
                  <MenuItem value="all">Tous statuts</MenuItem>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                  <MenuItem value="suspended">Suspendu</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={userFilters.type}
                  onChange={(e) => setUserFilters({ ...userFilters, type: e.target.value })}
                >
                  <MenuItem value="all">Tous types</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="worker">Artisan</MenuItem>
                  <MenuItem value="business">Entreprise</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        )}

        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Inscription</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <LinearProgress sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : allUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">Aucun utilisateur trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.role === 'client' ? 'Client' : user.role === 'worker' ? 'Artisan' : 'Entreprise'}
                        color={user.role === 'client' ? 'primary' : user.role === 'worker' ? 'secondary' : 'info'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      {user.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {user.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                        color={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'warning' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleUserStatusChange(
                            user.id,
                            user.status === 'active' ? 'suspended' : 'active'
                          )}
                        >
                          {user.status === 'active' ? 'Suspendre' : 'Activer'}
                        </Button>
                        <IconButton size="small" color="primary">
                          <Eye size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderRequestsTab = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'open': return 'warning';
        case 'assigned': return 'info';
        case 'in_progress': return 'primary';
        case 'completed': return 'success';
        case 'cancelled': return 'error';
        default: return 'default';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'open': return 'Ouverte';
        case 'assigned': return 'Assignée';
        case 'in_progress': return 'En cours';
        case 'completed': return 'Terminée';
        case 'cancelled': return 'Annulée';
        default: return status;
      }
    };

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Gestion des demandes
          </Typography>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={requestFilters.status}
                onChange={(e) => setRequestFilters({ ...requestFilters, status: e.target.value })}
              >
                <MenuItem value="all">Tous statuts</MenuItem>
                <MenuItem value="open">Ouverte</MenuItem>
                <MenuItem value="assigned">Assignée</MenuItem>
                <MenuItem value="in_progress">En cours</MenuItem>
                <MenuItem value="completed">Terminée</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={requestFilters.priority}
                onChange={(e) => setRequestFilters({ ...requestFilters, priority: e.target.value })}
              >
                <MenuItem value="all">Toutes priorités</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="normal">Normale</MenuItem>
                <MenuItem value="low">Basse</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Demande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingRequests ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <LinearProgress sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">Aucune demande trouvée</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {request.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {request.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.clientName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={request.service}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={request.priority === 'urgent' ? 'Urgente' : request.priority === 'high' ? 'Haute' : 'Normale'}
                        color={request.priority === 'urgent' ? 'error' : request.priority === 'high' ? 'warning' : 'info'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.budgetMin}-{request.budgetMax}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewRequest(request)}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleEditRequest(request)}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRequest(request.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                        {request.status === 'open' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewRequest(request)}
                          >
                            Assigner
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderReportsTab = () => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'default';
      }
    };

    const getReportStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'warning';
        case 'investigating': return 'info';
        case 'resolved': return 'success';
        case 'dismissed': return 'error';
        default: return 'default';
      }
    };

    const getReportStatusLabel = (status: string) => {
      switch (status) {
        case 'pending': return 'En attente';
        case 'investigating': return 'En cours';
        case 'resolved': return 'Résolu';
        case 'dismissed': return 'Rejeté';
        default: return status;
      }
    };

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Signalements et modération
          </Typography>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={reportFilters.status}
                onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
              >
                <MenuItem value="all">Tous statuts</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="investigating">En cours</MenuItem>
                <MenuItem value="resolved">Résolu</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={reportFilters.priority}
                onChange={(e) => setReportFilters({ ...reportFilters, priority: e.target.value })}
              >
                <MenuItem value="all">Toutes priorités</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Basse</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main" gutterBottom>
                  Signalements actifs
                </Typography>
                <Typography variant="h3">
                  {reports.filter(r => r.status === 'pending' || r.status === 'investigating').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  Haute priorité
                </Typography>
                <Typography variant="h3">
                  {reports.filter(r => r.priority === 'high').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main" gutterBottom>
                  Résolus ce mois
                </Typography>
                <Typography variant="h3">
                  {reports.filter(r => r.status === 'resolved').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Signalé par</TableCell>
                <TableCell>Concernant</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingReports ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <LinearProgress sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">Aucun signalement trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {report.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {report.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{report.reporterName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{report.reportedName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.reportedRole}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={report.priority === 'high' ? 'Haute' : report.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        color={getPriorityColor(report.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getReportStatusLabel(report.status)}
                        color={getReportStatusColor(report.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(report.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye size={16} />
                        </IconButton>
                        {report.status !== 'resolved' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewReport(report)}
                          >
                            Traiter
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderAnalyticsTab = () => {
    const mockAnalytics = {
      userGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Fév', users: 150 },
        { month: 'Mar', users: 180 },
        { month: 'Avr', users: 220 },
        { month: 'Mai', users: 280 },
        { month: 'Jun', users: 320 },
      ],
      requestStats: {
        total: 1456,
        completed: 1234,
        cancelled: 89,
        active: 133,
      },
      revenue: {
        total: 45678,
        monthly: 12345,
        average: 89,
      },
      topServices: [
        { name: 'Plomberie', count: 234, percentage: 28 },
        { name: 'Électricité', count: 198, percentage: 24 },
        { name: 'Peinture', count: 156, percentage: 19 },
        { name: 'Menuiserie', count: 134, percentage: 16 },
        { name: 'Jardinage', count: 89, percentage: 11 },
        { name: 'Autre', count: 23, percentage: 3 },
      ],
      userTypes: [
        { type: 'Clients', count: 1247, percentage: 65 },
        { type: 'Artisans', count: 456, percentage: 24 },
        { type: 'Entreprises', count: 234, percentage: 11 },
      ],
    };

    const displayAnalytics = analytics || mockAnalytics;

    // Ensure we have valid data structure
    const safeAnalytics = {
      requestStats: displayAnalytics.requestStats || mockAnalytics.requestStats,
      revenue: displayAnalytics.revenue || mockAnalytics.revenue,
      userTypes: Array.isArray(displayAnalytics.userTypes) ? displayAnalytics.userTypes : mockAnalytics.userTypes,
      userGrowth: Array.isArray(displayAnalytics.userGrowth) ? displayAnalytics.userGrowth : mockAnalytics.userGrowth,
      topServices: Array.isArray(displayAnalytics.topServices) ? displayAnalytics.topServices : mockAnalytics.topServices,
    };

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Analytics et statistiques
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value="30d"
              onChange={() => {}}
            >
              <MenuItem value="7d">7 jours</MenuItem>
              <MenuItem value="30d">30 jours</MenuItem>
              <MenuItem value="90d">90 jours</MenuItem>
              <MenuItem value="1y">1 an</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {loadingAnalytics ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      Demandes totales
                    </Typography>
                    <Typography variant="h3" fontWeight={800}>
                      {safeAnalytics.requestStats.total?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +12% ce mois
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Taux de completion
                    </Typography>
                    <Typography variant="h3" fontWeight={800}>
                      {safeAnalytics.requestStats.total && safeAnalytics.requestStats.completed
                        ? Math.round((safeAnalytics.requestStats.completed / safeAnalytics.requestStats.total) * 100)
                        : 0}%
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +2.1% ce mois
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      Revenus mensuels
                    </Typography>
                    <Typography variant="h3" fontWeight={800}>
                      {safeAnalytics.revenue.monthly?.toLocaleString() || '0'}€
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +8% ce mois
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="info.main" gutterBottom>
                      Utilisateurs actifs
                    </Typography>
                    <Typography variant="h3" fontWeight={800}>
                      {safeAnalytics.userTypes?.reduce((sum: number, type: any) => sum + (type?.count || 0), 0)?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +15% ce mois
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts and Details */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Services les plus demandés
                    </Typography>
                    <Stack spacing={2}>
                      {(safeAnalytics.topServices || []).map((service: any, index: number) => (
                        <Box key={service.name}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2">{service.name}</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {service.count} ({service.percentage}%)
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={service.percentage}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Répartition des utilisateurs
                    </Typography>
                    <Stack spacing={2}>
                      {(safeAnalytics.userTypes || []).map((userType: any) => (
                        <Box key={userType.type}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2">{userType.type}</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {userType.count} ({userType.percentage}%)
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={userType.percentage}
                            color={userType.type === 'Clients' ? 'primary' : userType.type === 'Artisans' ? 'secondary' : 'info'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Évolution des demandes
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', justifyContent: 'space-around', mt: 2 }}>
                      {(safeAnalytics.userGrowth || []).map((data: any, index: number) => (
                        <Box key={data.month} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 40,
                              height: `${(data.users / 400) * 150}px`,
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                              mb: 1,
                              minHeight: 20,
                            }}
                          />
                          <Typography variant="caption">{data.month}</Typography>
                          <Typography variant="caption" fontWeight={600}>{data.users}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
  };

  const renderSettingsTab = () => {
    const updateSetting = (category: string, key: string, value: any) => {
      setSettings((prev: any) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
      setSettingsChanged(true);
    };

    const defaultSettings = {
      platform: {
        name: 'Allobrico',
        maintenance: false,
        registrationEnabled: true,
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 24,
        twoFactorEnabled: false,
      },
      pricing: {
        platformFee: 5,
        artisanCommission: 10,
      },
    };

    const displaySettings = settings || defaultSettings;

    if (loadingSettings) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Configuration système
          </Typography>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={!settingsChanged || savingSettings}
            startIcon={savingSettings ? <CircularProgress size={16} /> : <Settings size={16} />}
          >
            {savingSettings ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Platform Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings size={20} /> Configuration de la plateforme
                </Typography>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <TextField
                    label="Nom de la plateforme"
                    value={displaySettings.platform?.name || ''}
                    onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.platform?.maintenance || false}
                        onChange={(e) => updateSetting('platform', 'maintenance', e.target.checked)}
                      />
                    }
                    label="Mode maintenance"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.platform?.registrationEnabled || false}
                        onChange={(e) => updateSetting('platform', 'registrationEnabled', e.target.checked)}
                      />
                    }
                    label="Inscriptions ouvertes"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageSquare size={20} /> Notifications
                </Typography>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.notifications?.emailEnabled || false}
                        onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                      />
                    }
                    label="Notifications par email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.notifications?.smsEnabled || false}
                        onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                      />
                    }
                    label="Notifications par SMS"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.notifications?.pushEnabled || false}
                        onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                      />
                    }
                    label="Notifications push"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={20} /> Sécurité
                </Typography>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <TextField
                    label="Longueur minimale du mot de passe"
                    type="number"
                    value={displaySettings.security?.passwordMinLength || 8}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    fullWidth
                  />
                  <TextField
                    label="Timeout de session (heures)"
                    type="number"
                    value={displaySettings.security?.sessionTimeout || 24}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.security?.twoFactorEnabled || false}
                        onChange={(e) => updateSetting('security', 'twoFactorEnabled', e.target.checked)}
                      />
                    }
                    label="Authentification à deux facteurs"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Pricing Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DollarSign size={20} /> Tarification
                </Typography>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <TextField
                    label="Commission plateforme (%)"
                    type="number"
                    value={displaySettings.pricing?.platformFee || 5}
                    onChange={(e) => updateSetting('pricing', 'platformFee', parseFloat(e.target.value))}
                    fullWidth
                    InputProps={{
                      endAdornment: <Typography variant="body2">%</Typography>,
                    }}
                  />
                  <TextField
                    label="Commission artisan (%)"
                    type="number"
                    value={displaySettings.pricing?.artisanCommission || 10}
                    onChange={(e) => updateSetting('pricing', 'artisanCommission', parseFloat(e.target.value))}
                    fullWidth
                    InputProps={{
                      endAdornment: <Typography variant="body2">%</Typography>,
                    }}
                  />
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Ces paramètres affectent le calcul des frais de service pour toutes les transactions.
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderModals = () => (
    <>
      {/* User Modal */}
      <Dialog
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {userAction === 'approve' ? 'Approuver l\'utilisateur' : userAction === 'reject' ? 'Rejeter l\'utilisateur' : 'Examiner l\'utilisateur'}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6">{selectedUser.name}</Typography>
                <Typography color="text.secondary">{selectedUser.type} - {selectedUser.category}</Typography>
                <Typography variant="body2">Email: {selectedUser.email}</Typography>
                <Typography variant="body2">Téléphone: {selectedUser.phone}</Typography>
              </Box>

              {selectedUser.documentsList && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Documents ({selectedUser.documents} à vérifier)</Typography>
                  <Stack spacing={1}>
                    {selectedUser.documentsList.map((doc: any) => (
                      <Box key={doc.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography>{doc.name}</Typography>
                        <Chip
                          size="small"
                          color={doc.status === 'verified' ? 'success' : 'warning'}
                          label={doc.status === 'verified' ? 'Vérifié' : 'En attente'}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {userAction === 'approve' && (
                <TextField
                  label="Notes d'approbation (optionnel)"
                  multiline
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Ajouter des notes sur l'approbation..."
                />
              )}

              {userAction === 'reject' && (
                <TextField
                  label="Raison du rejet *"
                  multiline
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquer la raison du rejet..."
                  required
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserModal(false)}>Annuler</Button>
          {userAction === 'approve' && (
            <Button variant="contained" color="success" onClick={handleApproveUser}>
              Approuver
            </Button>
          )}
          {userAction === 'reject' && (
            <Button variant="contained" color="error" onClick={handleRejectUser} disabled={!rejectionReason}>
              Rejeter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Report Modal */}
      <Dialog
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails du signalement</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6">{selectedReport.type}</Typography>
                <Typography color="text.secondary">
                  Signalé par: {selectedReport.reporter}
                </Typography>
                <Typography color="text.secondary">
                  Concernant: {selectedReport.reported}
                </Typography>
                <Chip
                  color={selectedReport.priority === 'high' ? 'error' : selectedReport.priority === 'medium' ? 'warning' : 'info'}
                  label={`Priorité ${selectedReport.priority}`}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Description</Typography>
                <Typography>{selectedReport.description}</Typography>
              </Box>

              {selectedReport.details && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>Détails</Typography>
                  <Typography>{selectedReport.details}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Statut actuel</Typography>
                <FormControl fullWidth>
                  <Select
                    value={reportStatus}
                    onChange={(e) => setReportStatus(e.target.value)}
                  >
                    <MenuItem value="pending">En attente</MenuItem>
                    <MenuItem value="investigating">En cours d'investigation</MenuItem>
                    <MenuItem value="resolved">Résolu</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Notes (optionnel)"
                multiline
                rows={3}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Ajouter des notes sur le traitement..."
              />

              {reportStatus === 'resolved' && (
                <TextField
                  label="Résolution"
                  multiline
                  rows={2}
                  value={reportResolution}
                  onChange={(e) => setReportResolution(e.target.value)}
                  placeholder="Décrire la résolution..."
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleUpdateReportStatus}>
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Modal */}
      <Dialog
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails de la demande</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6">{selectedRequest.title}</Typography>
                <Typography color="text.secondary">
                  Par: {selectedRequest.client}
                </Typography>
                <Typography color="text.secondary">
                  Service: {selectedRequest.service}
                </Typography>
                <Chip
                  color={selectedRequest.priority === 'urgent' ? 'error' : selectedRequest.priority === 'high' ? 'warning' : 'info'}
                  label={selectedRequest.priority === 'urgent' ? 'Urgent' : selectedRequest.priority === 'high' ? 'Haute' : 'Normale'}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Description</Typography>
                <Typography>{selectedRequest.description}</Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Détails</Typography>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Budget</Typography>
                    <Typography>{selectedRequest.budget.min}-{selectedRequest.budget.max}€</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Localisation</Typography>
                    <Typography>{selectedRequest.location}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Propositions</Typography>
                    <Typography>{selectedRequest.proposals}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRequestModal(false)}>Fermer</Button>
          {selectedRequest?.status === 'open' && (
            <Button 
              variant="contained" 
              onClick={() => {
                setShowRequestModal(false);
                handleOpenAssignmentModal(selectedRequest);
              }}
            >
              Assigner à un artisan
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog
        open={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Assigner la demande à un artisan
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={3}>
              {/* Request Summary */}
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedRequest.title}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Service: {selectedRequest.service} | Localisation: {selectedRequest.location}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Budget: {selectedRequest.budget.min}-{selectedRequest.budget.max}€
                </Typography>
              </Box>

              {/* Worker Selection */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Sélectionner un artisan disponible
                </Typography>
                
                {loadingWorkers ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : availableWorkers.length === 0 ? (
                  <Typography color="text.secondary">
                    Aucun artisan disponible trouvé
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {availableWorkers.map((worker) => (
                      <Card 
                        key={worker.id}
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedWorker?.id === worker.id ? 2 : 1,
                          borderColor: selectedWorker?.id === worker.id ? 'primary.main' : 'divider'
                        }}
                        onClick={() => setSelectedWorker(worker)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 48, height: 48 }}>
                              {worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {worker.firstName} {worker.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {worker.specialty || 'Spécialité non définie'}
                              </Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Star size={14} color="#ffa500" fill="#ffa500" />
                                  <Typography variant="caption">
                                    {worker.rating || 0}/5
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {worker.jobsCompleted || 0} projets
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {worker.location || 'Localisation non définie'}
                                </Typography>
                              </Stack>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" color="primary">
                                {worker.hourlyRate ? `${worker.hourlyRate}€/h` : 'Prix non défini'}
                              </Typography>
                              <Chip
                                size="small"
                                color={worker.workerStatus === 'available' ? 'success' : 'warning'}
                                label={worker.workerStatus === 'available' ? 'Disponible' : 'Occupé'}
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Assignment Notes */}
              {selectedWorker && (
                <TextField
                  label="Notes d'assignation (optionnel)"
                  multiline
                  rows={3}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Ajouter des notes pour l'artisan..."
                  fullWidth
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignmentModal(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={!selectedWorker}
            onClick={() => {
              if (selectedRequest && selectedWorker) {
                handleAssignRequest(selectedRequest.id, selectedWorker.id, assignmentNotes);
              }
            }}
          >
            Assigner la demande
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog
        open={showEditRequestModal}
        onClose={() => setShowEditRequestModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Modifier la demande</DialogTitle>
        <DialogContent>
          {editingRequest && (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                label="Titre"
                fullWidth
                value={editingRequest.title || ''}
                onChange={(e) => setEditingRequest({ ...editingRequest, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={editingRequest.description || ''}
                onChange={(e) => setEditingRequest({ ...editingRequest, description: e.target.value })}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Budget minimum (€)"
                  type="number"
                  value={editingRequest.budgetMin || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, budgetMin: parseFloat(e.target.value) || null })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Budget maximum (€)"
                  type="number"
                  value={editingRequest.budgetMax || ''}
                  onChange={(e) => setEditingRequest({ ...editingRequest, budgetMax: parseFloat(e.target.value) || null })}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <TextField
                label="Localisation"
                fullWidth
                value={editingRequest.location || ''}
                onChange={(e) => setEditingRequest({ ...editingRequest, location: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={editingRequest.priority || 'normal'}
                  onChange={(e) => setEditingRequest({ ...editingRequest, priority: e.target.value })}
                  label="Priorité"
                >
                  <MenuItem value="low">Basse</MenuItem>
                  <MenuItem value="normal">Normale</MenuItem>
                  <MenuItem value="high">Haute</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes administrateur"
                fullWidth
                multiline
                rows={3}
                value={editingRequest.adminNotes || ''}
                onChange={(e) => setEditingRequest({ ...editingRequest, adminNotes: e.target.value })}
                placeholder="Notes internes pour l'administration..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditRequestModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleUpdateRequest}>
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={32} /> Administration
                </Box>
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Centre de contrôle de la plateforme Allobrico
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton color="primary">
                <Badge badgeContent={notifications?.length || 0} color="error">
                  <MessageSquare size={20} />
                </Badge>
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<Settings size={16} />}
                onClick={() => setActiveTab(5)}
              >
                Paramètres
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Paper sx={{ borderRadius: 0, bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 3,
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 600,
            }
          }}
        >
          <Tab
            icon={<BarChart3 size={20} />}
            label="Tableau de bord"
            iconPosition="start"
          />
          <Tab
            icon={<UserCheck size={20} />}
            label="Utilisateurs"
            iconPosition="start"
          />
          <Tab
            icon={<ClipboardList size={20} />}
            label="Demandes"
            iconPosition="start"
          />
          <Tab
            icon={<Flag size={20} />}
            label="Signalements"
            iconPosition="start"
          />
          <Tab
            icon={<Database size={20} />}
            label="Analytics"
            iconPosition="start"
          />
          <Tab
            icon={<Settings size={20} />}
            label="Configuration"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ p: 3 }}>
        {activeTab === 0 && renderDashboardTab()}
        {activeTab === 1 && renderUsersTab()}
        {activeTab === 2 && renderRequestsTab()}
        {activeTab === 3 && renderReportsTab()}
        {activeTab === 4 && renderAnalyticsTab()}
        {activeTab === 5 && renderSettingsTab()}
      </Box>

      {/* Modals */}
      {renderModals()}
    </Box>
  );
};

export default AdminDashboard;
