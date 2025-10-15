import React from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Briefcase,
  Star,
  Award,
  Settings,
  Plus,
  Eye,
  Phone,
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
} from '@mui/material';
import { api } from '../utils';

interface BusinessDashboardProps {
  userProfile: any;
  notifications: Array<any>;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  userProfile,
  notifications,
}) => {
  const stats = [
    {
      label: 'Employés actifs',
      value: '12',
      change: '+2 ce mois',
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Projets en cours',
      value: '28',
      change: '5 à planifier',
      icon: Briefcase,
      color: 'text-warning',
    },
    {
      label: 'CA mensuel',
      value: '45,200€',
      change: '+18% vs mois dernier',
      icon: DollarSign,
      color: 'text-success',
    },
    {
      label: 'Note entreprise',
      value: '4.9',
      change: 'Top 5% sur AllobBrico',
      icon: Star,
      color: 'text-success',
    },
  ];

  const employees = [
    {
      id: 1,
      name: 'Pierre Dubois',
      specialty: 'Plombier expert',
      status: 'En mission',
      rating: 4.8,
      projects: 15,
      location: 'Paris 15ème',
      avatar: 'PD',
    },
    {
      id: 2,
      name: 'Marie Laurent',
      specialty: 'Électricienne',
      status: 'Disponible',
      rating: 4.9,
      projects: 12,
      location: 'En déplacement',
      avatar: 'ML',
    },
    {
      id: 3,
      name: 'Thomas Martin',
      specialty: 'Chauffagiste',
      status: 'Pause déjeuner',
      rating: 4.7,
      projects: 18,
      location: 'Vanves',
      avatar: 'TM',
    },
  ];

  const recentProjects = [
    {
      id: 1,
      title: 'Rénovation salle de bain',
      client: 'Mme Sophie R.',
      employee: 'Pierre Dubois',
      status: 'En cours',
      progress: 65,
      budget: '3,500€',
      deadline: '25 mars',
      type: 'Plomberie',
    },
    {
      id: 2,
      title: 'Installation électrique',
      client: 'M. Jean M.',
      employee: 'Marie Laurent',
      status: 'À commencer',
      progress: 0,
      budget: '1,200€',
      deadline: '30 mars',
      type: 'Électricité',
    },
    {
      id: 3,
      title: 'Maintenance chauffage',
      client: 'Résidence Les Jardins',
      employee: 'Thomas Martin',
      status: 'Terminé',
      progress: 100,
      budget: '850€',
      deadline: '15 mars',
      type: 'Chauffage',
    },
  ];

  const createProject = async () => {
    try {
      await api.post('/projects', {
        title: 'Nouveau projet',
        client: 'Client',
        budget: '0€',
        deadline: '2025-12-31',
        type: 'Général',
      });
    } catch (e) {
      console.error(e);
    }
  };

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
              <Briefcase size={28} /> Tableau de bord entreprise
            </Typography>
            <Typography color="text.secondary">
              Gérez votre équipe et vos projets
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Settings size={16} />}
              aria-label="Ouvrir les paramètres"
            >
              Paramètres
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              aria-label="Ajouter un nouvel employé"
            >
              Nouvel employé
            </Button>
          </Stack>
        </Stack>

        {/* Stats: compact, single row; scroll on mobile */}
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
                sx={{ p: 2, flex: { xs: '0 0 200px', md: 'initial' } }}
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

      {/* Main Content */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { lg: '2fr 1fr' }, gap: 3 }}
      >
        {/* Projets en cours */}
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
                  Projets actifs
                </Typography>
                <Stack direction="row" spacing={1}>
                  <FormControl size="small">
                    <Select value={'all'} aria-label="Filtrer les projets">
                      <MenuItem value="all">Tous les projets</MenuItem>
                      <MenuItem value="enCours">En cours</MenuItem>
                      <MenuItem value="aCommencer">À commencer</MenuItem>
                      <MenuItem value="retard">En retard</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Plus size={14} />}
                    aria-label="Créer un nouveau projet"
                    onClick={createProject}
                  >
                    Nouveau
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Box>
              {recentProjects.map((project, idx) => (
                <Box key={project.id} sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 1.5 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.title}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Typography variant="body2">
                          {project.client}
                        </Typography>
                        <Typography variant="body2">•</Typography>
                        <Typography variant="body2">{project.type}</Typography>
                        <Typography variant="body2">•</Typography>
                        <Typography variant="body2">
                          {project.employee}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box textAlign="right">
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor:
                            project.status === 'En cours'
                              ? 'warning.light'
                              : project.status === 'À commencer'
                                ? 'primary.light'
                                : 'success.light',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.status}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ mt: 0.5 }}
                      >
                        {project.budget && typeof project.budget === 'object' ? 
                         `${(project.budget as any).min || 0}-${(project.budget as any).max || 0}€` : 
                         project.budget || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mb: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Progression
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {project.progress}%
                      </Typography>
                    </Stack>
                    <Box
                      sx={{ height: 8, bgcolor: 'divider', borderRadius: 4 }}
                    >
                      <Box
                        sx={{
                          width: `${project.progress}%`,
                          height: '100%',
                          bgcolor:
                            project.progress === 100
                              ? 'success.main'
                              : project.progress > 50
                                ? 'primary.main'
                                : 'warning.main',
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ color: 'text.secondary' }}
                    >
                      <Calendar size={16} />
                      <Typography variant="body2">
                        Échéance: {project.deadline}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Eye size={14} />}
                        aria-label="Voir les détails du projet"
                        sx={{ whiteSpace: 'nowrap' }}
                        onClick={async () => {
                          try {
                            await api.get(`/projects/${project.id}`);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        Détails
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Phone size={14} />}
                        aria-label="Contacter le client"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Contact
                      </Button>
                    </Stack>
                  </Stack>

                  {idx < recentProjects.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Sidebar */}
        <Stack spacing={2}>
          {/* Équipe */}
          <Paper>
            <Box
              sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>Équipe</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Plus size={14} />}
                  aria-label="Ajouter un membre à l'équipe"
                />
              </Stack>
            </Box>
            <Stack sx={{ p: 2 }} spacing={1}>
              {employees.map((employee) => (
                <Stack
                  key={employee.id}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {employee.avatar}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {employee.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {employee.specialty}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor:
                            employee.status === 'Disponible'
                              ? 'success.main'
                              : employee.status === 'En mission'
                                ? 'warning.main'
                                : 'text.disabled',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {employee.status}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box textAlign="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <Star
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <Typography variant="caption" fontWeight={600}>
                        {employee.rating}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {employee.projects} projets
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* Performance entreprise */}
          <Paper>
            <Box
              sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Typography fontWeight={700}>Performance</Typography>
            </Box>
            <Stack sx={{ p: 2 }} spacing={2}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary" fontWeight={800}>
                  4.9
                </Typography>
                <Stack direction="row" justifyContent="center" sx={{ my: 0.5 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="fill-yellow-400 text-yellow-400"
                      size={16}
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Note moyenne entreprise
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Basée sur 156 avis
                </Typography>
              </Box>
              <Divider />
              <Stack direction="row" spacing={1} alignItems="center">
                <Award size={18} style={{ color: '#f59e0b' }} />
                <Typography variant="body2" fontWeight={600}>
                  Certifications
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined">
                  Qualibat
                </Button>
                <Button size="small" variant="outlined">
                  RGE
                </Button>
                <Button size="small" variant="outlined">
                  Artisan Plus
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Activité récente */}
          <Paper>
            <Box
              sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Typography fontWeight={700}>Activité récente</Typography>
            </Box>
            <Stack sx={{ p: 2 }} spacing={1.5}>
              <Stack direction="row" spacing={1.5}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    mt: '6px',
                  }}
                />
                <Box>
                  <Typography variant="body2">
                    Nouveau projet assigné
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pierre • Il y a 2h
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    mt: '6px',
                  }}
                />
                <Box>
                  <Typography variant="body2">Projet terminé</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Thomas • Il y a 4h
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: 'warning.main',
                    borderRadius: '50%',
                    mt: '6px',
                  }}
                />
                <Box>
                  <Typography variant="body2">Nouveau avis client</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Marie • Il y a 1 jour
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default BusinessDashboard;
