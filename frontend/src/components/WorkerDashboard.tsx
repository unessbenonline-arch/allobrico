import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Calendar,
  Clock,
  Briefcase,
  DollarSign,
  Phone,
  Mail,
  Camera,
  Settings,
  TrendingUp,
  CheckCircle,
  Play,
  Pause,
  X,
  Upload,
  Eye,
  Edit,
  Plus,
  Image as ImageIcon,
  FileText,
  Users,
  BarChart3,
  MessageCircle,
} from 'lucide-react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
  Input,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { api, projectService, workerService, requestService, getLocationString } from '../utils';
import Chat from './Chat';

interface WorkerDashboardProps {
  userProfile: any;
  notifications: Array<any>;
  myRequests: Array<any>;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  progress: number;
  milestones: Milestone[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  completedAt?: string;
}

interface ProgressUpdate {
  id: string;
  projectId: string;
  description: string;
  photos: string[];
  timestamp: string;
  milestoneId?: string;
}

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isUrgent: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  clientId: string;
  workerId?: string;
  createdAt: string;
  updatedAt: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  distance?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  beforeImages?: string[];
  afterImages?: string[];
  completionDate: string;
  clientRating?: number;
  clientReview?: string;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  userProfile,
  notifications,
  myRequests,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog states
  const [progressDialog, setProgressDialog] = useState({ open: false, project: null as Project | null });
  const [projectDialog, setProjectDialog] = useState({ open: false, project: null as Project | null });
  const [portfolioDialog, setPortfolioDialog] = useState({ open: false, item: null as PortfolioItem | null });
  const [offerDialog, setOfferDialog] = useState({ open: false, request: null as any });
  const [requestDetailDialog, setRequestDetailDialog] = useState({ open: false, request: null as any });

  // Form states
  const [progressForm, setProgressForm] = useState({
    description: '',
    photos: [] as File[],
    milestoneId: '',
  });

  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    category: '',
    images: [] as File[],
    beforeImages: [] as File[],
    afterImages: [] as File[],
    completionDate: '',
  });

  const [offerForm, setOfferForm] = useState({
    price: '',
    description: '',
    timeline: '',
    availability: '',
  });

  const stats = [
    {
      label: 'Demandes reçues',
      value: '23',
      change: '+5 cette semaine',
      icon: Briefcase,
      color: 'text-primary',
    },
    {
      label: 'Projets actifs',
      value: projects.filter(p => p.status === 'in_progress').length.toString(),
      change: `${projects.filter(p => p.status === 'completed').length} terminés`,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Note moyenne',
      value: '4.8',
      change: '★ Excellent',
      icon: Star,
      color: 'text-success',
    },
    {
      label: 'Revenus du mois',
      value: '3,450€',
      change: '+12% vs mois dernier',
      icon: DollarSign,
      color: 'text-primary',
    },
  ];

  type PendingRequest = {
    id: number;
    type: string;
    title: string;
    location: string;
    urgency: 'urgent' | 'normal' | 'planned';
    distance: string;
    budget: string;
    time: string;
    client: string;
    offered?: boolean;
  };

  const [availableRequests, setAvailableRequests] = React.useState<PendingRequest[]>([]);

  const [pendingRequests, setPendingRequests] = React.useState<PendingRequest[]>(
    myRequests || []
  );

  useEffect(() => {
    loadDashboardData();
  }, [userProfile.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch available requests for workers to view
  // Fetch open requests using requestService (consistent with other stores)
  const availableRequestsResponse = await requestService.getRequests({ status: 'open', limit: 20 }) as any;
  const availableRequestsData = availableRequestsResponse?.data || availableRequestsResponse?.data?.data || availableRequestsResponse || [];

      // Transform available requests
      const transformedAvailableRequests = availableRequestsData.map((request: any) => ({
        id: request.id,
        type: request.service || request.category_name || 'Service',
        title: request.title,
        location: request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location?.address || request.location || 'N/A',
        urgency: request.urgency === 'urgent' || request.priority === 'urgent' ? 'urgent' : (request.priority === 'high' ? 'normal' : 'planned'),
        distance: 'N/A', // Placeholder until geo calc implemented
        budget: request.budget ? `${request.budget.min || 0}-${request.budget.max || 0}${request.budget.currency || '€'}` : (request.budget_min !== undefined ? `${request.budget_min || 0}-${request.budget_max || 0}${request.currency || '€'}` : 'N/A'),
        time: request.createdAt ? `Il y a ${Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60))}h` : 'N/A',
        client: request.clientName || 'Client',
        offered: false,
        description: request.description,
        subcategory: request.subcategory,
        complexity: request.projectDetails?.complexity || request.complexity || 3,
        scope: request.projectDetails?.scope || request.scope || 'small',
        estimatedDuration: request.scheduling?.estimatedDuration || request.estimatedDuration,
        durationUnit: request.scheduling?.durationUnit || request.durationUnit || 'hours',
        preferredStartDate: request.scheduling?.preferredStartDate || request.preferredStartDate,
        preferredEndDate: request.scheduling?.preferredEndDate || request.preferredEndDate,
        isRecurring: request.projectDetails?.isRecurring || request.isRecurring || false,
        recurringFrequency: request.projectDetails?.recurringFrequency || request.recurringFrequency,
        requiredCertifications: request.requirements?.certifications || request.requiredCertifications || [],
        specialInstructions: request.requirements?.specialInstructions || request.specialInstructions,
        locationType: request.location?.type || request.locationType || 'home',
        accessType: request.projectDetails?.access || request.access || 'normal',
        materialsProvidedBy: request.projectDetails?.materials || request.materials || 'client',
        contactPreference: request.requirements?.contactPreference || request.contactPreference || 'both',
        budgetType: request.budget?.type || request.budget_type || 'fixed',
        technicalRequirements: request.requirements?.technical || request.requirements
      }));

      setAvailableRequests(transformedAvailableRequests);

      // Get worker's projects, portfolio, and requests from API (keeping existing logic)
      const [projectsResponse, portfolioResponse, requestsResponse] = await Promise.all([
        projectService.getWorkerProjects(userProfile.id),
        workerService.getWorkerPortfolio(userProfile.id),
        workerService.getWorkerRequests(userProfile.id)
      ]);

      const projects = (projectsResponse as any).data || [];
      const portfolio = (portfolioResponse as any).data || [];
      const requests = (requestsResponse as any).data || [];

      // Calculate progress based on completed milestones for each project
      const projectsWithCalculatedProgress = projects.map((project: Project) => ({
        ...project,
        progress: project.milestones && project.milestones.length > 0
          ? Math.round((project.milestones.filter((m: any) => m.completed).length / project.milestones.length) * 100)
          : 0
      }));

      setProjects(projectsWithCalculatedProgress);
      setPortfolio(portfolio);

      // Transform requests to match PendingRequest structure
      const transformedRequests = requests.map((request: any) => ({
        id: request.id,
        type: request.service || request.category || request.category_name || 'Service',
        title: request.title,
        location: request.location?.address || request.location || 'N/A',
        urgency: request.urgency === 'urgent' || request.priority === 'urgent' ? 'urgent' : (request.priority === 'high' ? 'normal' : 'planned'),
        distance: request.distance || 'N/A',
        budget: request.budget ? `${request.budget.min}-${request.budget.max}€` : (request.budget_min !== undefined ? `${request.budget_min}-${request.budget_max}€` : 'N/A'),
        time: request.createdAt ? `Il y a ${Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60))}h` : 'N/A',
        client: request.clientName || request.clientId || 'Client',
        offered: false
      }));

      setPendingRequests(transformedRequests);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOffer = (request: any) => {
    setOfferDialog({ open: true, request });
    setOfferForm({
      price: '',
      description: '',
      timeline: '',
      availability: '',
    });
  };

  const handleSubmitOffer = async () => {
    if (!offerDialog.request) return;

    try {
      await api.post(`/api/requests/${offerDialog.request.id}/offers`, {
        workerId: userProfile.id,
        price: parseFloat(offerForm.price),
        description: offerForm.description,
        timeline: offerForm.timeline,
        availability: offerForm.availability,
      });

      setPendingRequests((prev) =>
        prev.map((r) => (r.id === offerDialog.request.id ? { ...r, offered: true } : r))
      );

      setOfferDialog({ open: false, request: null });
      setSnackbar({ open: true, message: 'Offre envoyée avec succès', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Erreur lors de l\'envoi de l\'offre', severity: 'error' });
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const handleProgressUpdate = async () => {
    if (!progressDialog.project || !progressForm.description) return;

    try {
      const formData = new FormData();
      formData.append('projectId', progressDialog.project.id);
      formData.append('description', progressForm.description);
      if (progressForm.milestoneId) {
        formData.append('milestoneId', progressForm.milestoneId);
      }
      progressForm.photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      await projectService.addProgressUpdate(progressDialog.project.id, formData);

      setSnackbar({ open: true, message: 'Mise à jour du progrès ajoutée avec succès', severity: 'success' });
      setProgressDialog({ open: false, project: null });
      setProgressForm({ description: '', photos: [], milestoneId: '' });
      loadDashboardData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour du progrès', severity: 'error' });
    }
  };

  const handlePortfolioSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', portfolioForm.title);
      formData.append('description', portfolioForm.description);
      formData.append('category', portfolioForm.category);
      formData.append('completionDate', portfolioForm.completionDate);
      
      portfolioForm.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      portfolioForm.beforeImages.forEach((image, index) => {
        formData.append(`beforeImage_${index}`, image);
      });
      portfolioForm.afterImages.forEach((image, index) => {
        formData.append(`afterImage_${index}`, image);
      });

      await workerService.addPortfolioItem(userProfile.id, formData);

      setSnackbar({ open: true, message: 'Projet ajouté au portfolio avec succès', severity: 'success' });
      setPortfolioDialog({ open: false, item: null });
      setPortfolioForm({
        title: '',
        description: '',
        category: '',
        images: [],
        beforeImages: [],
        afterImages: [],
        completionDate: '',
      });
      loadDashboardData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'ajout au portfolio', severity: 'error' });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'progress' | 'portfolio' | 'before' | 'after') => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      if (type === 'progress') {
        setProgressForm(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
      } else if (type === 'portfolio') {
        setPortfolioForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
      } else if (type === 'before') {
        setPortfolioForm(prev => ({ ...prev, beforeImages: [...prev.beforeImages, ...files] }));
      } else if (type === 'after') {
        setPortfolioForm(prev => ({ ...prev, afterImages: [...prev.afterImages, ...files] }));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'flex-start' }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Briefcase size={28} /> Tableau de bord Artisan
            </Typography>
            <Typography color="text.secondary">
              Gérez vos projets, demandes et portfolio
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Settings size={16} />}
              aria-label="Ouvrir les paramètres du profil"
            >
              Profil
            </Button>
            <Button
              variant="contained"
              startIcon={<Calendar size={16} />}
              onClick={() => setShowCalendar(true)}
              aria-label="Voir le planning"
            >
              Planning
            </Button>
          </Stack>
        </Stack>

        {/* Stats */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: { xs: 'flex', md: 'grid' },
              gridTemplateColumns: { md: 'repeat(4, 1fr)' },
              gap: 2,
              overflowX: { xs: 'auto', md: 'visible' },
              pb: { xs: 1, md: 0 },
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {stats.map((stat, index) => (
              <Paper
                key={index}
                sx={{ p: 2, flex: { xs: '0 0 200px', md: 'initial' }, bgcolor: 'background.paper' }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <stat.icon className={stat.color} size={22} />
                  <TrendingUp size={14} style={{ opacity: 0.6 }} />
                </Stack>
                <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {stat.change}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%', mb: 3, bgcolor: 'background.paper' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="worker dashboard tabs">
          <Tab label="Demandes" />
          <Tab label="Projets actifs" />
          <Tab label="Portfolio" />
          <Tab label="Statistiques" />
          <Tab label="Messages" />
        </Tabs>

        {/* Requests Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Paper>
              <Box
                sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight={700}>
                    Nouvelles demandes
                  </Typography>
                  <FormControl size="small">
                    <Select value={'all'} aria-label="Filtrer les demandes">
                      <MenuItem value="all">Toutes les demandes</MenuItem>
                      <MenuItem value="urgent">Urgentes seulement</MenuItem>
                      <MenuItem value="zone">Dans ma zone</MenuItem>
                      <MenuItem value="budget">Budget élevé</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              <Box>
                {availableRequests.map((request, idx) => (
                  <Box key={request.id} sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 1.5 }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        <Paper
                          sx={{
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Briefcase size={22} />
                        </Paper>
                        <Box>
                          <Typography
                            fontWeight={700}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {request.title}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {request.type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 180,
                              }}
                            >
                              {request.client}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      <Box textAlign="right">
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor:
                              request.urgency === 'urgent'
                                ? 'error.light'
                                : request.urgency === 'normal'
                                  ? 'warning.light'
                                  : 'success.light',
                          }}
                        >
                          {request.urgency === 'urgent'
                            ? 'Urgent'
                            : request.urgency === 'normal'
                              ? 'Normal'
                              : 'Planifié'}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {request.time}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={3}
                      sx={{ color: 'text.secondary', mb: 1.5 }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MapPin size={16} />
                        <Typography variant="body2">
                          {getLocationString(request.location)}{' '}
                          <Box component="span" sx={{ color: 'text.disabled' }}>
                            ({request.distance})
                          </Box>
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <DollarSign size={16} />
                        <Typography variant="body2">
                          {request.budget && typeof request.budget === 'object' ? 
                           `${(request.budget as any).min || 0}-${(request.budget as any).max || 0}€` : 
                           request.budget || 'N/A'}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
                    >
                      <Button
                        variant="outlined"
                        color="info"
                        sx={{ flex: 1, minWidth: 120 }}
                        aria-label={`Voir les détails de ${request.title}`}
                        onClick={() => setRequestDetailDialog({ open: true, request })}
                      >
                        <Eye size={16} style={{ marginRight: 8 }} />
                        Détails
                      </Button>
                      <Button
                        variant={request.offered ? 'outlined' : 'contained'}
                        color={request.offered ? ('success' as any) : 'primary'}
                        disabled={!!request.offered}
                        sx={{ flex: 1, minWidth: 140 }}
                        aria-label={`Faire une offre pour ${request.title}`}
                        onClick={() => handleOffer(request)}
                      >
                        {request.offered ? 'Offre envoyée' : 'Faire une offre'}
                      </Button>
                      <Button
                        variant="outlined"
                        aria-label="Appeler le client"
                        sx={{ flexShrink: 0 }}
                        onClick={() => handleCall('0612345678')}
                      >
                        <Phone size={16} />
                      </Button>
                      <Button
                        variant="outlined"
                        aria-label="Envoyer un email au client"
                        sx={{ flexShrink: 0 }}
                        onClick={() => {
                          window.location.href = `mailto:client@example.com?subject=Offre%20pour%20${encodeURIComponent(request.title)}`;
                        }}
                      >
                        <Mail size={16} />
                      </Button>
                    </Stack>

                    {idx < pendingRequests.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Button variant="outlined">
                  Voir toutes les demandes ({availableRequests.length})
                </Button>
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* Projects Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                Mes projets actifs
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setProjectDialog({ open: true, project: null })}
              >
                Nouveau projet
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              {projects.filter(p => p.status === 'in_progress').map((project) => (
                <Card key={project.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>{project.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {project.category}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(project.status)}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progression</Typography>
                        <Typography variant="body2">{project.progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={project.progress} />
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MapPin size={16} />
                        <Typography variant="body2">{project.location.address}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <DollarSign size={16} />
                        <Typography variant="body2">
                          {project.budget.min}€ - {project.budget.max}€
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Milestones */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Jalons ({project.milestones.filter(m => m.completed).length}/{project.milestones.length})
                      </Typography>
                      <Stepper orientation="vertical">
                        {project.milestones.slice(0, 3).map((milestone, index) => (
                          <Step key={milestone.id} completed={milestone.completed}>
                            <StepLabel>
                              <Typography variant="body2">{milestone.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(milestone.dueDate).toLocaleDateString('fr-FR')}
                              </Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Camera size={16} />}
                        onClick={() => setProgressDialog({ open: true, project })}
                        fullWidth
                      >
                        Mettre à jour
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Eye size={16} />}
                        onClick={() => setProjectDialog({ open: true, project })}
                        fullWidth
                      >
                        Détails
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </TabPanel>

        {/* Portfolio Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                Mon Portfolio
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setPortfolioDialog({ open: true, item: null })}
              >
                Ajouter un projet
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              {portfolio.map((item) => (
                <Card key={item.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.images[0] || '/api/placeholder/400/300'}
                    alt={item.title}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.category}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    {item.clientRating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Star size={16} color="#ffa500" fill="#ffa500" />
                        <Typography variant="body2">{item.clientRating}/5</Typography>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Terminé le {new Date(item.completionDate).toLocaleDateString('fr-FR')}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Eye size={16} />}>
                      Voir détails
                    </Button>
                    <Button size="small" startIcon={<Edit size={16} />}>
                      Modifier
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
              Statistiques détaillées
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Performance mensuelle</Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Taux de réponse</Typography>
                    <Typography variant="body2" fontWeight={600}>95%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={95} color="success" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Projets terminés</Typography>
                    <Typography variant="body2" fontWeight={600}>87%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={87} color="primary" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Satisfaction client</Typography>
                    <Typography variant="body2" fontWeight={600}>4.8/5</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={96} color="success" />
                </Box>
              </Paper>
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Revenus</Typography>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h4" fontWeight={800} color="primary">
                    3,450€
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ce mois-ci
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Objectif mensuel</Typography>
                  <Typography variant="body2">4,000€</Typography>
                </Box>
                <LinearProgress variant="determinate" value={86} color="primary" />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  550€ restants pour atteindre l'objectif
                </Typography>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        {/* Messages Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ height: 'calc(100vh - 300px)' }}>
            <Chat currentUser={{ id: 'worker1', name: 'Jean Martin', type: 'worker' }} />
          </Box>
        </TabPanel>
      </Paper>

      {/* Progress Update Dialog */}
      <Dialog
        open={progressDialog.open}
        onClose={() => setProgressDialog({ open: false, project: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Mettre à jour le progrès - {progressDialog.project?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description de la mise à jour"
            fullWidth
            multiline
            rows={3}
            value={progressForm.description}
            onChange={(e) => setProgressForm(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              value={progressForm.milestoneId}
              onChange={(e) => setProgressForm(prev => ({ ...prev, milestoneId: e.target.value }))}
              displayEmpty
            >
              <MenuItem value="">Aucun jalon spécifique</MenuItem>
              {progressDialog.project?.milestones
                .filter(m => !m.completed)
                .map((milestone) => (
                  <MenuItem key={milestone.id} value={milestone.id}>
                    {milestone.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Photos du progrès (optionnel)
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="progress-photos"
              multiple
              type="file"
              onChange={(e) => handlePhotoUpload(e, 'progress')}
            />
            <label htmlFor="progress-photos">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload size={16} />}
                fullWidth
              >
                Ajouter des photos
              </Button>
            </label>
            {progressForm.photos.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {progressForm.photos.length} photo(s) sélectionnée(s)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialog({ open: false, project: null })}>
            Annuler
          </Button>
          <Button
            onClick={handleProgressUpdate}
            variant="contained"
            disabled={!progressForm.description}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog
        open={portfolioDialog.open}
        onClose={() => setPortfolioDialog({ open: false, item: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {portfolioDialog.item ? 'Modifier le projet' : 'Ajouter un projet au portfolio'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre du projet"
            fullWidth
            value={portfolioForm.title}
            onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={portfolioForm.description}
            onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Catégorie"
            fullWidth
            value={portfolioForm.category}
            onChange={(e) => setPortfolioForm(prev => ({ ...prev, category: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Date de réalisation"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={portfolioForm.completionDate}
            onChange={(e) => setPortfolioForm(prev => ({ ...prev, completionDate: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Photos du projet
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="portfolio-photos"
              multiple
              type="file"
              onChange={(e) => handlePhotoUpload(e, 'portfolio')}
            />
            <label htmlFor="portfolio-photos">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload size={16} />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Photos principales
              </Button>
            </label>
            {portfolioForm.images.length > 0 && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {portfolioForm.images.length} photo(s) principale(s)
              </Typography>
            )}

            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="before-photos"
              multiple
              type="file"
              onChange={(e) => handlePhotoUpload(e, 'before')}
            />
            <label htmlFor="before-photos">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload size={16} />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Photos avant travaux
              </Button>
            </label>
            {portfolioForm.beforeImages.length > 0 && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {portfolioForm.beforeImages.length} photo(s) avant
              </Typography>
            )}

            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="after-photos"
              multiple
              type="file"
              onChange={(e) => handlePhotoUpload(e, 'after')}
            />
            <label htmlFor="after-photos">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload size={16} />}
                fullWidth
              >
                Photos après travaux
              </Button>
            </label>
            {portfolioForm.afterImages.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {portfolioForm.afterImages.length} photo(s) après
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPortfolioDialog({ open: false, item: null })}>
            Annuler
          </Button>
          <Button
            onClick={handlePortfolioSubmit}
            variant="contained"
            disabled={!portfolioForm.title || !portfolioForm.description}
          >
            {portfolioDialog.item ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar Modal */}
      <Dialog
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Mon Planning Complet
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentMonth(newDate);
                }}
              >
                ‹ Précédent
              </Button>
              <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentMonth(newDate);
                }}
              >
                Suivant ›
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Calendar Header */}
            <Box sx={{ display: 'flex', mb: 1 }}>
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                <Box key={day} sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    textAlign="center"
                    sx={{ py: 1, color: 'text.secondary' }}
                  >
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {Array.from({ length: 42 }, (_, i) => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const firstDay = date.getDay();
                const dayNumber = i - firstDay + 1;
                const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
                const isToday = currentDate.toDateString() === new Date().toDateString();

                // Sample appointments data
                const appointments = [
                  { date: 15, time: '09:00', client: 'Mme Dubois', service: 'Plomberie', location: 'Paris 15ème' },
                  { date: 15, time: '14:00', client: 'M. Martin', service: 'Dépannage', location: 'Vanves' },
                  { date: 22, time: '10:30', client: 'Mme Leroy', service: 'Électricité', location: 'Boulogne' },
                  { date: 28, time: '16:00', client: 'M. Bernard', service: 'Peinture', location: 'Neuilly' },
                ];

                const dayAppointments = appointments.filter(apt => apt.date === dayNumber && isCurrentMonth);

                return (
                  <Box key={i} sx={{ width: '14.28%', p: 0.25 }}>
                    <Paper
                      sx={{
                        height: 100,
                        p: 0.5,
                        bgcolor: isToday ? 'primary.light' : isCurrentMonth ? 'background.paper' : 'action.disabledBackground',
                        border: isToday ? '2px solid' : '1px solid',
                        borderColor: isToday ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: isToday ? 'primary.main' : 'action.hover',
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={isToday ? 700 : 500}
                        color={isToday ? 'primary.contrastText' : isCurrentMonth ? 'text.primary' : 'text.disabled'}
                        sx={{ mb: 0.5 }}
                      >
                        {isCurrentMonth ? dayNumber : ''}
                      </Typography>
                      <Stack spacing={0.25}>
                        {dayAppointments.map((apt, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                              p: 0.25,
                              borderRadius: 0.5,
                              fontSize: '0.7rem',
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {apt.time} - {apt.service}
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Box>
                );
              })}
            </Box>

            {/* Legend */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Légende
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">Rendez-vous confirmé</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'primary.light', border: '2px solid', borderColor: 'primary.main' }} />
                  <Typography variant="caption">Aujourd'hui</Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCalendar(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog
        open={offerDialog.open}
        onClose={() => setOfferDialog({ open: false, request: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Faire une offre - {offerDialog.request?.title}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {offerDialog.request && (
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Détails de la demande
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {offerDialog.request.description}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Chip
                    label={offerDialog.request.category}
                    variant="outlined"
                    size="small"
                  />
                  {offerDialog.request.isUrgent && (
                    <Chip
                      label="Urgent"
                      color="error"
                      size="small"
                    />
                  )}
                </Stack>
                <Typography variant="body2">
                  <strong>Budget client:</strong> {offerDialog.request.budget?.min}€ - {offerDialog.request.budget?.max}€
                </Typography>
                <Typography variant="body2">
                  <strong>Localisation:</strong> {offerDialog.request.location?.address}
                </Typography>
              </Box>
            )}

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Votre offre
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Prix proposé (€)"
                  type="number"
                  value={offerForm.price}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, price: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label="Description de votre offre"
                  multiline
                  rows={3}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez vos services, votre expérience, les matériaux utilisés..."
                  fullWidth
                  required
                />
                <TextField
                  label="Délai d'intervention"
                  value={offerForm.timeline}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="Ex: 2-3 jours, 1 semaine..."
                  fullWidth
                  required
                />
                <TextField
                  label="Disponibilité"
                  value={offerForm.availability}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="Ex: Disponible dès lundi, Cette semaine..."
                  fullWidth
                  required
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferDialog({ open: false, request: null })}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitOffer}
            disabled={!offerForm.price || !offerForm.description || !offerForm.timeline || !offerForm.availability}
          >
            Envoyer l'offre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Detail Dialog */}
      <Dialog
        open={requestDetailDialog.open}
        onClose={() => setRequestDetailDialog({ open: false, request: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Détails de la demande
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {requestDetailDialog.request && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {requestDetailDialog.request.title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    label={requestDetailDialog.request.type}
                    color="primary"
                    size="small"
                  />
                  {requestDetailDialog.request.subcategory && (
                    <Chip
                      label={requestDetailDialog.request.subcategory}
                      color="secondary"
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    label={requestDetailDialog.request.urgency === 'urgent' ? 'Urgent' : requestDetailDialog.request.urgency === 'critical' ? 'Critique' : 'Normal'}
                    color={requestDetailDialog.request.urgency === 'urgent' || requestDetailDialog.request.urgency === 'critical' ? 'error' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={`Complexité: ${requestDetailDialog.request.complexity || 3}/5`}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Description du projet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {requestDetailDialog.request.description || 'Aucune description disponible'}
                </Typography>

                {/* Project Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle2" color="primary">Échelle du projet</Typography>
                    <Typography variant="body2">
                      {requestDetailDialog.request.scope === 'small' ? 'Petit projet' :
                       requestDetailDialog.request.scope === 'medium' ? 'Moyen projet' :
                       requestDetailDialog.request.scope === 'large' ? 'Grand projet' : 'Entreprise'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <Typography variant="subtitle2" color="primary">Type de lieu</Typography>
                    <Typography variant="body2">
                      {requestDetailDialog.request.locationType === 'home' ? 'Domicile' :
                       requestDetailDialog.request.locationType === 'business' ? 'Commerce/Bureau' : 'Lieu public'}
                    </Typography>
                  </Box>
                  {requestDetailDialog.request.estimatedDuration && (
                    <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                      <Typography variant="subtitle2" color="primary">Durée estimée</Typography>
                      <Typography variant="body2">
                        {requestDetailDialog.request.estimatedDuration} {requestDetailDialog.request.durationUnit}
                      </Typography>
                    </Box>
                  )}
                  {requestDetailDialog.request.isRecurring && (
                    <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                      <Typography variant="subtitle2" color="primary">Projet récurrent</Typography>
                      <Typography variant="body2">
                        {requestDetailDialog.request.recurringFrequency === 'weekly' ? 'Hebdomadaire' :
                         requestDetailDialog.request.recurringFrequency === 'monthly' ? 'Mensuelle' :
                         requestDetailDialog.request.recurringFrequency === 'quarterly' ? 'Trimestrielle' : 'Régulier'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Informations pratiques
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <MapPin size={20} color="#666" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Localisation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {requestDetailDialog.request.location}
                        {requestDetailDialog.request.location?.details && (
                          <><br />{requestDetailDialog.request.location.details}</>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Accès: {requestDetailDialog.request.accessType === 'normal' ? 'Normal' :
                               requestDetailDialog.request.accessType === 'restricted' ? 'Restreint' : 'Complet'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <DollarSign size={20} color="#666" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Budget ({requestDetailDialog.request.budget?.type || 'Prix fixe'})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {requestDetailDialog.request.budget?.min || 0} - {requestDetailDialog.request.budget?.max || 0} {requestDetailDialog.request.budget?.currency || '€'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Matériaux: {requestDetailDialog.request.materialsProvidedBy === 'client' ? 'Fournis par client' :
                                   requestDetailDialog.request.materialsProvidedBy === 'worker' ? 'Inclus' : 'À discuter'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Calendar size={20} color="#666" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Dates souhaitées
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {requestDetailDialog.request.preferredStartDate && requestDetailDialog.request.preferredEndDate ?
                          `${new Date(requestDetailDialog.request.preferredStartDate).toLocaleDateString('fr-FR')} - ${new Date(requestDetailDialog.request.preferredEndDate).toLocaleDateString('fr-FR')}` :
                          requestDetailDialog.request.scheduling?.preferredSchedule || 'À définir'
                        }
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Users size={20} color="#666" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Client
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {requestDetailDialog.request.client}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Contact: {requestDetailDialog.request.contactPreference === 'phone' ? 'Téléphone prioritaire' :
                                 requestDetailDialog.request.contactPreference === 'email' ? 'Email prioritaire' : 'Téléphone ou email'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Clock size={20} color="#666" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Publié
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {requestDetailDialog.request.time}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              {requestDetailDialog.request.technicalRequirements && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Exigences techniques
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {requestDetailDialog.request.technicalRequirements}
                  </Typography>
                </Box>
              )}

              {requestDetailDialog.request.specialInstructions && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Instructions spéciales
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {requestDetailDialog.request.specialInstructions}
                  </Typography>
                </Box>
              )}

              {requestDetailDialog.request.requiredCertifications && requestDetailDialog.request.requiredCertifications.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Certifications requises
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {requestDetailDialog.request.requiredCertifications.map((cert: string, index: number) => (
                      <Chip
                        key={index}
                        label={cert}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {requestDetailDialog.request.attachments && requestDetailDialog.request.attachments.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Pièces jointes
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {requestDetailDialog.request.attachments.map((attachment: string, index: number) => (
                      <Chip
                        key={index}
                        label={attachment}
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // Handle attachment download/view
                          console.log('View attachment:', attachment);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDetailDialog({ open: false, request: null })}>
            Fermer
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setRequestDetailDialog({ open: false, request: null });
              if (requestDetailDialog.request) {
                handleOffer(requestDetailDialog.request);
              }
            }}
          >
            Faire une offre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkerDashboard;
