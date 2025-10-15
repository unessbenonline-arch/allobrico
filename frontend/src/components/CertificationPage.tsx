import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Award,
  CheckCircle,
  Clock,
  Star,
  Play,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { api } from '../utils';

interface CertificationPageProps {
  userProfile: any;
}

interface Formation {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: number;
  timeLimit: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  score: number | null;
  maxScore: number;
  completedAt?: string;
  status: 'not_taken' | 'passed' | 'failed';
}

interface Certification {
  id: number;
  title: string;
  description: string;
  validity: string;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  requirements: string[];
  obtainedAt?: string;
  expiresAt?: string;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CertificationPage: React.FC<CertificationPageProps> = ({ userProfile }) => {
  const [tabValue, setTabValue] = useState(0);
  const [formations, setFormations] = useState<Formation[]>([
    {
      id: 1,
      title: 'Formation Sécurité Électrique',
      description: 'Apprenez les normes de sécurité essentielles pour les travaux électriques',
      duration: '2h',
      difficulty: 'Débutant',
      category: 'Sécurité',
      progress: 0,
      status: 'not_started',
    },
    {
      id: 2,
      title: 'Plomberie Moderne',
      description: 'Techniques avancées de plomberie et matériaux contemporains',
      duration: '4h',
      difficulty: 'Intermédiaire',
      category: 'Technique',
      progress: 0,
      status: 'not_started',
    },
    {
      id: 3,
      title: 'Gestion de Projet BTP',
      description: 'Méthodes de gestion efficaces pour vos chantiers',
      duration: '3h',
      difficulty: 'Avancé',
      category: 'Management',
      progress: 0,
      status: 'not_started',
    },
  ]);

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: 'Quiz Sécurité Électrique',
      description: 'Testez vos connaissances en sécurité électrique',
      questions: 15,
      timeLimit: '20 min',
      difficulty: 'Débutant',
      score: null,
      maxScore: 15,
      status: 'not_taken',
    },
    {
      id: 2,
      title: 'Quiz Plomberie',
      description: 'Évaluez vos compétences en plomberie',
      questions: 20,
      timeLimit: '30 min',
      difficulty: 'Intermédiaire',
      score: null,
      maxScore: 20,
      status: 'not_taken',
    },
  ]);

  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: 1,
      title: 'Certificat Sécurité Électrique',
      description: 'Certification officielle en sécurité électrique',
      validity: '5 ans',
      status: 'available',
      requirements: ['Formation Sécurité Électrique', 'Quiz Sécurité Électrique'],
    },
    {
      id: 2,
      title: 'Certificat Plomberie',
      description: 'Certification professionnelle en plomberie',
      validity: '3 ans',
      status: 'available',
      requirements: ['Formation Plomberie Moderne', 'Quiz Plomberie'],
    },
  ]);

  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [formationDialog, setFormationDialog] = useState(false);
  const [quizDialog, setQuizDialog] = useState(false);
  const [certificationDialog, setCertificationDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleStartFormation = (formation: Formation) => {
    setSelectedFormation(formation);
    setFormationDialog(true);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizDialog(true);
  };

  const handleRequestCertification = (certification: Certification) => {
    setSelectedCertification(certification);
    setCertificationDialog(true);
  };

  const completeFormation = (formationId: number) => {
    setFormations(prev => prev.map(f =>
      f.id === formationId
        ? { ...f, status: 'completed', progress: 100, completedAt: new Date().toISOString() }
        : f
    ));
    setSnackbar({ open: true, message: 'Formation terminée avec succès !', severity: 'success' });
  };

  const completeQuiz = (quizId: number, score: number) => {
    const passed = score >= 12; // 80% passing score
    setQuizzes(prev => prev.map(q =>
      q.id === quizId
        ? {
            ...q,
            score,
            status: passed ? 'passed' : 'failed',
            completedAt: new Date().toISOString()
          }
        : q
    ));
    setSnackbar({ open: true, message: passed ? 'Quiz réussi !' : 'Quiz échoué, réessayez plus tard.', severity: passed ? 'success' : 'error' });
  };

  const requestCertification = (certificationId: number) => {
    setCertifications(prev => prev.map(c =>
      c.id === certificationId
        ? { ...c, status: 'in_progress' }
        : c
    ));
    setSnackbar({ open: true, message: 'Demande de certification envoyée !', severity: 'success' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'success';
      case 'Intermédiaire': return 'warning';
      case 'Avancé': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed': return 'success';
      case 'in_progress': return 'primary';
      case 'failed': return 'error';
      case 'available': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started': return 'Non commencé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'not_taken': return 'Non passé';
      case 'passed': return 'Réussi';
      case 'failed': return 'Échoué';
      case 'available': return 'Disponible';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
              <GraduationCap size={32} />
              Formation & Certification
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Développez vos compétences et obtenez des certifications reconnues
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <BookOpen size={32} color="#1976d2" style={{ margin: '0 auto 8px' }} />
            <Typography variant="h4" fontWeight={700}>
              {formations.filter(f => f.status === 'completed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Formations terminées
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Award size={32} color="#ff9800" style={{ margin: '0 auto 8px' }} />
            <Typography variant="h4" fontWeight={700}>
              {quizzes.filter(q => q.status === 'passed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quiz réussis
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Trophy size={32} color="#4caf50" style={{ margin: '0 auto 8px' }} />
            <Typography variant="h4" fontWeight={700}>
              {certifications.filter(c => c.status === 'completed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Certifications obtenues
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUp size={32} color="#9c27b0" style={{ margin: '0 auto 8px' }} />
            <Typography variant="h4" fontWeight={700}>
              {Math.round((formations.filter(f => f.status === 'completed').length / formations.length) * 100)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Progression globale
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<BookOpen size={20} />}
            label="Formations"
            iconPosition="start"
          />
          <Tab
            icon={<Award size={20} />}
            label="Quiz"
            iconPosition="start"
          />
          <Tab
            icon={<Trophy size={20} />}
            label="Certifications"
            iconPosition="start"
          />
        </Tabs>

        {/* Formations Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {formations.map((formation) => (
              <Card sx={{ height: '100%' }} key={formation.id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {formation.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formation.description}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={formation.duration}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={formation.difficulty}
                        color={getDifficultyColor(formation.difficulty)}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={formation.category}
                        color="info"
                        variant="outlined"
                      />
                    </Stack>

                    {formation.status === 'in_progress' && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">Progression</Typography>
                          <Typography variant="body2">{formation.progress}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={formation.progress} />
                      </Box>
                    )}

                    <Chip
                      label={getStatusLabel(formation.status)}
                      color={getStatusColor(formation.status)}
                      size="small"
                    />
                  </Stack>
                </CardContent>
                <CardActions>
                  {formation.status === 'not_started' && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Play size={16} />}
                      onClick={() => handleStartFormation(formation)}
                    >
                      Commencer
                    </Button>
                  )}
                  {formation.status === 'in_progress' && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Play size={16} />}
                      onClick={() => handleStartFormation(formation)}
                    >
                      Continuer
                    </Button>
                  )}
                  {formation.status === 'completed' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CheckCircle size={16} />}
                      disabled
                    >
                      Terminé
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Quiz Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {quizzes.map((quiz) => (
              <Card sx={{ height: '100%' }} key={quiz.id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {quiz.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quiz.description}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`${quiz.questions} questions`}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={quiz.timeLimit}
                        color="warning"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={quiz.difficulty}
                        color={getDifficultyColor(quiz.difficulty)}
                        variant="outlined"
                      />
                    </Stack>

                    {quiz.score !== null && (
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Score: {quiz.score}/{quiz.maxScore}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(quiz.score / quiz.maxScore) * 100}
                          color={quiz.status === 'passed' ? 'success' : 'error'}
                        />
                      </Box>
                    )}

                    <Chip
                      label={getStatusLabel(quiz.status)}
                      color={getStatusColor(quiz.status)}
                      size="small"
                    />
                  </Stack>
                </CardContent>
                <CardActions>
                  {quiz.status === 'not_taken' && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<Play size={16} />}
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      Passer le quiz
                    </Button>
                  )}
                  {quiz.status === 'passed' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CheckCircle size={16} />}
                      disabled
                    >
                      Réussi
                    </Button>
                  )}
                  {quiz.status === 'failed' && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<Play size={16} />}
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      Retenter
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Certifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {certifications.map((certification) => (
              <Card sx={{ height: '100%' }} key={certification.id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {certification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {certification.description}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`Validité: ${certification.validity}`}
                        color="success"
                        variant="outlined"
                      />
                    </Stack>

                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Prérequis:
                      </Typography>
                      <Stack spacing={0.5}>
                        {certification.requirements.map((req, index) => (
                          <Typography key={index} variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            • {req}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Chip
                      label={getStatusLabel(certification.status)}
                      color={getStatusColor(certification.status)}
                      size="small"
                    />
                  </Stack>
                </CardContent>
                <CardActions>
                  {certification.status === 'available' && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<Trophy size={16} />}
                      onClick={() => handleRequestCertification(certification)}
                    >
                      Demander
                    </Button>
                  )}
                  {certification.status === 'in_progress' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Clock size={16} />}
                      disabled
                    >
                      En cours
                    </Button>
                  )}
                  {certification.status === 'completed' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CheckCircle size={16} />}
                      disabled
                    >
                      Obtenue
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </Paper>

      {/* Formation Dialog */}
      <Dialog
        open={formationDialog}
        onClose={() => setFormationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BookOpen size={24} color="#1976d2" />
            <Typography variant="h6" fontWeight={600}>
              {selectedFormation?.title}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedFormation && (
            <Stack spacing={3}>
              <Typography variant="body1">
                {selectedFormation.description}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip label={`Durée: ${selectedFormation.duration}`} color="primary" variant="outlined" />
                <Chip label={`Niveau: ${selectedFormation.difficulty}`} color="secondary" variant="outlined" />
                <Chip label={`Catégorie: ${selectedFormation.category}`} color="info" variant="outlined" />
              </Stack>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Objectifs d'apprentissage:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    • Acquérir les compétences essentielles
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    • Maîtriser les normes et réglementations
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    • Appliquer les bonnes pratiques
                  </Typography>
                </Stack>
              </Box>

              {selectedFormation.status === 'in_progress' && (
                <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>
                    Progression: {selectedFormation.progress}% complété
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedFormation.progress}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormationDialog(false)}>
            Fermer
          </Button>
          {selectedFormation?.status !== 'completed' && (
            <Button
              variant="contained"
              startIcon={<Play size={16} />}
              onClick={() => {
                // Simulate completing the formation
                if (selectedFormation) {
                  completeFormation(selectedFormation.id);
                  setFormationDialog(false);
                }
              }}
            >
              {selectedFormation?.status === 'in_progress' ? 'Marquer comme terminé' : 'Commencer la formation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog
        open={quizDialog}
        onClose={() => setQuizDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Award size={24} color="#ff9800" />
            <Typography variant="h6" fontWeight={600}>
              {selectedQuiz?.title}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedQuiz && (
            <Stack spacing={3}>
              <Typography variant="body1">
                {selectedQuiz.description}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip label={`${selectedQuiz.questions} questions`} color="warning" variant="outlined" />
                <Chip label={`Temps: ${selectedQuiz.timeLimit}`} color="error" variant="outlined" />
                <Chip label={`Niveau: ${selectedQuiz.difficulty}`} color="secondary" variant="outlined" />
              </Stack>

              <Alert severity="warning">
                Le quiz doit être complété en une seule session. Assurez-vous d'avoir suffisamment de temps.
              </Alert>

              {selectedQuiz.score !== null && (
                <Box sx={{ bgcolor: selectedQuiz.status === 'passed' ? 'success.50' : 'error.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" color={selectedQuiz.status === 'passed' ? 'success.main' : 'error.main'} fontWeight={600}>
                    Score obtenu: {selectedQuiz.score}/{selectedQuiz.maxScore}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizDialog(false)}>
            Fermer
          </Button>
          {selectedQuiz?.status === 'not_taken' || selectedQuiz?.status === 'failed' ? (
            <Button
              variant="contained"
              color="warning"
              startIcon={<Play size={16} />}
              onClick={() => {
                // Simulate taking the quiz and getting a random score
                if (selectedQuiz) {
                  const score = Math.floor(Math.random() * selectedQuiz.maxScore) + 1;
                  completeQuiz(selectedQuiz.id, score);
                  setQuizDialog(false);
                }
              }}
            >
              Commencer le quiz
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog
        open={certificationDialog}
        onClose={() => setCertificationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Trophy size={24} color="#4caf50" />
            <Typography variant="h6" fontWeight={600}>
              {selectedCertification?.title}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedCertification && (
            <Stack spacing={3}>
              <Typography variant="body1">
                {selectedCertification.description}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip label={`Validité: ${selectedCertification.validity}`} color="success" variant="outlined" />
                <Chip
                  label={selectedCertification.status === 'available' ? 'Disponible' : 'En cours'}
                  color={selectedCertification.status === 'available' ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Stack>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Prérequis:
                </Typography>
                <Stack spacing={1}>
                  {selectedCertification.requirements.map((req, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      • {req}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              <Alert severity="info">
                Cette certification est reconnue par les professionnels du secteur et valorisera votre profil.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificationDialog(false)}>
            Fermer
          </Button>
          {selectedCertification?.status === 'available' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Trophy size={16} />}
              onClick={() => {
                if (selectedCertification) {
                  requestCertification(selectedCertification.id);
                  setCertificationDialog(false);
                }
              }}
            >
              Demander la certification
            </Button>
          )}
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

export default CertificationPage;