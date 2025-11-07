import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stack,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Slider,
  Stepper,
  Step,
  StepLabel,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MapPin,
  Upload,
  X,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Wrench,
  Home,
  Building,
  Car,
  Zap,
  Droplets,
  Paintbrush,
  Hammer,
  Settings,
  Palette,
  Leaf,
  Snowflake,
  Flame,
  MoreHorizontal,
} from 'lucide-react';
import { api } from '../utils';
// New reusable category select component extracted for clarity
// (You asked to recreate from scratch: this isolates category logic and robust icon rendering)

// Robust icon renderer supporting lucide names and legacy emoji values
const renderCategoryIcon = (raw: string) => {
  if (!raw) return <Settings size={18} />;
  const iconName = raw.trim();
  // If already an emoji (length <=3 and not alphanumeric) just render
  if (/[^\w]/.test(iconName) && iconName.length <= 3) {
    return <span style={{ fontSize: 18 }}>{iconName}</span>;
  }
  switch (iconName) {
    case 'Wrench': return <Wrench size={18} />;
    case 'Zap': return <Zap size={18} />;
    case 'Palette': return <Palette size={18} />;
    case 'Hammer': return <Hammer size={18} />;
    case 'Leaf': return <Leaf size={18} />;
    case 'Snowflake': return <Snowflake size={18} />;
    case 'Flame': return <Flame size={18} />;
    case 'Home': return <Home size={18} />;
    case 'MoreHorizontal': return <MoreHorizontal size={18} />;
    default: return <Settings size={18} />;
  }
};

// Legacy exported helper kept (in case other components import it) now delegates
export const getCategoryIcon = (iconName: string) => renderCategoryIcon(iconName);

interface CreateDemandeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  is_active: boolean;
  // Optional fields coming from future backend enhancement
  color?: string;
  slug?: string;
  popular?: boolean;
}

interface LocationOption {
  label: string;
  value: string;
}

const CreateDemandeDialog: React.FC<CreateDemandeDialogProps> = ({
  open,
  onClose,
  onSuccess,
  clientId,
}) => {
  const [formData, setFormData] = useState({
    title: 'Réparation urgente de fuite d\'eau dans la cuisine',
    description: 'Fuite importante sous l\'évier de la cuisine avec risque d\'inondation. Le robinet d\'arrêt ne fonctionne plus correctement. Besoin d\'intervention rapide avant que les dégâts ne s\'aggravent.',
    categoryId: '',
    subcategory: 'plomberie',
    priority: 'high',
    urgency: 'urgent',
    budgetMin: '80',
    budgetMax: '150',
    budgetType: 'fixed',
    currency: 'EUR',
    location: 'Paris 15ème',
    locationDetails: 'Appartement 3ème étage, code d\'entrée 1234A, ascenseur disponible',
    locationType: 'home',
    preferredSchedule: 'Aujourd\'hui si possible, disponible toute la journée',
    preferredStartDate: '',
    preferredEndDate: '',
    estimatedDuration: '2',
    durationUnit: 'hours',
    requirements: 'Artisan qualifié avec assurance décennale, outils appropriés pour réparation plomberie',
    specialInstructions: 'Prévoir de couper l\'eau si nécessaire. Nettoyer après intervention. Fournir facture détaillée.',
    contactPreference: 'both',
    complexity: 3,
    scope: 'small',
    recurring: false,
    recurringFrequency: 'weekly',
    certifications: ['plomberie'],
    materials: 'worker',
    access: 'normal',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // French cities and locations for autocomplete
  const frenchLocations = [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
    'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre',
    'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes',
    'Villeurbanne', 'Saint-Denis', 'Aix-en-Provence', 'Clermont-Ferrand',
    'Boulogne-Billancourt', 'Limoges', 'Tours', 'Amiens', 'Metz', 'Besançon',
    'Orléans', 'Mulhouse', 'Rouen', 'Caen', 'Nancy', 'Saint-Paul', 'Roubaix'
  ];

  useEffect(() => {
    if (open) {
      loadCategories();
      // Initialize location options
      setLocationOptions(frenchLocations.map(city => ({ label: city, value: city })));
      // Reset stepper to first step
      setActiveStep(0);
    }
  }, [open]);

  // Scroll detection for stepper using Intersection Observer
  useEffect(() => {
    if (!open) return;

    const sections = [
      'step-basic-info',
      'step-project-details',
      'step-budget-planning',
      'step-specific-requirements'
    ];

    const observers: IntersectionObserver[] = [];

    // Use setTimeout to ensure DOM is fully rendered
    const setupObservers = () => {
      const dialogContent = document.querySelector('.MuiDialogContent-root');
      if (!dialogContent) {
        console.log('Stepper: Dialog content not found, retrying...');
        setTimeout(setupObservers, 100);
        return;
      }

      sections.forEach((sectionId, index) => {
        const element = document.getElementById(sectionId);
        if (element) {
          console.log(`Stepper: Setting up observer for ${sectionId}`);
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                  // Element is at least 30% visible
                  console.log(`Stepper: Section ${sectionId} is now visible (${entry.intersectionRatio})`);
                  setActiveStep(index);
                }
              });
            },
            {
              root: dialogContent,
              rootMargin: '-80px 0px -50px 0px', // Trigger when element is near the top
              threshold: [0.1, 0.3, 0.5, 0.7, 1.0]
            }
          );

          observer.observe(element);
          observers.push(observer);
        } else {
          console.log(`Stepper: Element ${sectionId} not found`);
        }
      });
    };

    setTimeout(setupObservers, 200);

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [open]);  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
  const response = await api.get('/categories') as any;
  // Support both {data:[...]} and direct array
  const categoriesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCategories(categoriesData);
      
      // Set default category (Plomberie) if available
      const plomberieCategory = categoriesData.find((cat: Category) => cat.name === 'Plomberie');
      if (plomberieCategory) {
        setFormData(prev => ({
          ...prev,
          categoryId: plomberieCategory.id
        }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.categoryId) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (parseFloat(formData.budgetMin) >= parseFloat(formData.budgetMax)) {
      setError('Le budget minimum doit être inférieur au budget maximum');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare form data for API
      const requestData = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategory: formData.subcategory,
        clientId: clientId,
        priority: formData.priority,
        urgency: formData.urgency,
        budgetMin: parseFloat(formData.budgetMin) || null,
        budgetMax: parseFloat(formData.budgetMax) || null,
        budgetType: formData.budgetType,
        currency: formData.currency,
        location: formData.location,
        locationDetails: formData.locationDetails,
        locationType: formData.locationType,
        preferredSchedule: formData.preferredSchedule,
        preferredStartDate: formData.preferredStartDate,
        preferredEndDate: formData.preferredEndDate,
        estimatedDuration: formData.estimatedDuration,
        durationUnit: formData.durationUnit,
        requirements: formData.requirements,
        specialInstructions: formData.specialInstructions,
        contactPreference: formData.contactPreference,
        complexity: formData.complexity,
        scope: formData.scope,
        recurring: formData.recurring,
        recurringFrequency: formData.recurring ? formData.recurringFrequency : null,
        certifications: formData.certifications,
        materials: formData.materials,
        access: formData.access,
        attachments: attachments.map(file => file.name), // In real app, upload files first
      };

      const response = await api.post('/requests', requestData) as any;

      if (response.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          categoryId: '',
          subcategory: '',
          priority: 'normal',
          urgency: 'normal',
          budgetMin: '',
          budgetMax: '',
          budgetType: 'fixed',
          currency: 'EUR',
          location: '',
          locationDetails: '',
          locationType: 'home',
          preferredSchedule: '',
          preferredStartDate: '',
          preferredEndDate: '',
          estimatedDuration: '',
          durationUnit: 'hours',
          requirements: '',
          specialInstructions: '',
          contactPreference: 'both',
          complexity: 3,
          scope: 'small',
          recurring: false,
          recurringFrequency: 'weekly',
          certifications: [],
          materials: 'client',
          access: 'normal',
        });
        setAttachments([]);
      } else {
        setError('Erreur lors de la création de la demande');
      }
    } catch (error: any) {
      console.error('Error creating request:', error);
      setError(error.response?.data?.message || error.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError('');
      // Reset to test data for easier testing
      setFormData({
        title: 'Réparation urgente de fuite d\'eau dans la cuisine',
        description: 'Fuite importante sous l\'évier de la cuisine avec risque d\'inondation. Le robinet d\'arrêt ne fonctionne plus correctement. Besoin d\'intervention rapide avant que les dégâts ne s\'aggravent.',
        categoryId: '',
        subcategory: 'plomberie',
        priority: 'high',
        urgency: 'urgent',
        budgetMin: '80',
        budgetMax: '150',
        budgetType: 'fixed',
        currency: 'EUR',
        location: 'Paris 15ème',
        locationDetails: 'Appartement 3ème étage, code d\'entrée 1234A, ascenseur disponible',
        locationType: 'home',
        preferredSchedule: 'Aujourd\'hui si possible, disponible toute la journée',
        preferredStartDate: '',
        preferredEndDate: '',
        estimatedDuration: '2',
        durationUnit: 'hours',
        requirements: 'Artisan qualifié avec assurance décennale, outils appropriés pour réparation plomberie',
        specialInstructions: 'Prévoir de couper l\'eau si nécessaire. Nettoyer après intervention. Fournir facture détaillée.',
        contactPreference: 'both',
        complexity: 3,
        scope: 'small',
        recurring: false,
        recurringFrequency: 'weekly',
        certifications: ['plomberie'],
        materials: 'worker',
        access: 'normal',
      });
      setAttachments([]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Créer une nouvelle demande
        </Typography>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          maxHeight: '70vh',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
          },
        }}
      >
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1000, 
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            py: 2,
            mb: 4,
            mx: -3,
            px: 3
          }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {[
                { label: 'Informations générales', id: 'step-basic-info' },
                { label: 'Détails du projet', id: 'step-project-details' },
                { label: 'Budget & Planning', id: 'step-budget-planning' },
                { label: 'Exigences spécifiques', id: 'step-specific-requirements' }
              ].map((step, index) => (
                <Step key={step.id}>
                  <StepLabel
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      const element = document.getElementById(step.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Step 1: Basic Information */}
            <Card elevation={2} id="step-basic-info">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info size={20} />
                  Informations générales
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Titre de la demande *"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: Réparation urgente de fuite d'eau dans la cuisine"
                      required
                      helperText="Soyez précis et descriptif pour attirer les bons professionnels"
                    />
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description détaillée *"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez précisément le problème, les symptômes, ce qui fonctionne/ne fonctionne pas..."
                      required
                      helperText="Plus de détails = meilleures offres de professionnels qualifiés"
                    />
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth required>
                      <InputLabel>Catégorie de service *</InputLabel>
                      <Select
                        value={formData.categoryId}
                        onChange={(e) => handleInputChange('categoryId', e.target.value)}
                        disabled={loadingCategories}
                        renderValue={(selected) => {
                          if (!selected) return 'Sélectionner';
                          const cat = categories.find(c => c.id === selected);
                          if (!cat) return 'Sélectionner';
                          return (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{
                                width: 30,
                                height: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: (theme) => cat.color ? cat.color : theme.palette.action.hover,
                              }}>
                                {renderCategoryIcon(cat.icon)}
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{cat.name}</Typography>
                                {cat.description && (
                                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                    {cat.description.length > 40 ? cat.description.slice(0, 37) + '…' : cat.description}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          );
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: { maxHeight: 360 }
                          }
                        }}
                      >
                        {loadingCategories && (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Chargement...
                          </MenuItem>
                        )}
                        {!loadingCategories && categories.filter(cat => cat.is_active).map(category => (
                          <MenuItem
                            key={category.id}
                            value={category.id}
                            sx={{ alignItems: 'flex-start' }}
                          >
                            <Stack direction="row" spacing={1} alignItems="flex-start" width="100%">
                              <Box sx={{
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: (theme) => category.color ? category.color : theme.palette.action.hover,
                                flexShrink: 0,
                              }}>
                                {renderCategoryIcon(category.icon)}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>{category.name}</Typography>
                                {category.description && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                                    {category.description}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </MenuItem>
                        ))}
                        {!loadingCategories && categories.filter(cat => cat.is_active).length === 0 && (
                          <MenuItem disabled>Aucune catégorie active</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Sous-catégorie</InputLabel>
                      <Select
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      >
                        <MenuItem value="repair">Réparation</MenuItem>
                        <MenuItem value="installation">Installation</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                        <MenuItem value="renovation">Rénovation</MenuItem>
                        <MenuItem value="emergency">Urgence</MenuItem>
                        <MenuItem value="consultation">Consultation</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Priorité</InputLabel>
                      <Select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                      >
                        <MenuItem value="low">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle size={16} color="#4caf50" />
                            Basse - Dans les 2 semaines
                          </Box>
                        </MenuItem>
                        <MenuItem value="normal">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={16} color="#ff9800" />
                            Normale - Dans la semaine
                          </Box>
                        </MenuItem>
                        <MenuItem value="high">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AlertTriangle size={16} color="#f44336" />
                            Haute - Dans 2-3 jours
                          </Box>
                        </MenuItem>
                        <MenuItem value="urgent">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Zap size={16} color="#f44336" />
                            Urgente - Aujourd'hui
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Urgence</InputLabel>
                      <Select
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                      >
                        <MenuItem value="low">Faible - Pas de deadline</MenuItem>
                        <MenuItem value="normal">Normale - Flexible</MenuItem>
                        <MenuItem value="high">Élevée - Cette semaine</MenuItem>
                        <MenuItem value="critical">Critique - Immédiat</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Step 2: Project Details */}
            <Card elevation={2} id="step-project-details">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Wrench size={20} />
                  Détails du projet
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Complexité du projet (1-5)
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={formData.complexity}
                        onChange={(_, value) => handleInputChange('complexity', value)}
                        min={1}
                        max={5}
                        step={1}
                        marks={[
                          { value: 1, label: 'Simple' },
                          { value: 3, label: 'Moyen' },
                          { value: 5, label: 'Complexe' }
                        ]}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Échelle du projet</InputLabel>
                      <Select
                        value={formData.scope}
                        onChange={(e) => handleInputChange('scope', e.target.value)}
                      >
                        <MenuItem value="small">Petit - 1 pièce/un élément</MenuItem>
                        <MenuItem value="medium">Moyen - Plusieurs pièces</MenuItem>
                        <MenuItem value="large">Grand - Maison entière</MenuItem>
                        <MenuItem value="enterprise">Entreprise - Bâtiment commercial</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Type de lieu</InputLabel>
                      <Select
                        value={formData.locationType}
                        onChange={(e) => handleInputChange('locationType', e.target.value)}
                      >
                        <MenuItem value="home">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Home size={16} />
                            Domicile
                          </Box>
                        </MenuItem>
                        <MenuItem value="business">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Building size={16} />
                            Commerce/Bureau
                          </Box>
                        </MenuItem>
                        <MenuItem value="public">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Building size={16} />
                            Lieu public
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <Autocomplete
                      freeSolo
                      options={locationOptions}
                      getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                      value={formData.location}
                      onChange={(event, newValue) => {
                        handleInputChange('location', typeof newValue === 'string' ? newValue : newValue?.value || '');
                      }}
                      onInputChange={(event, newInputValue) => {
                        handleInputChange('location', newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="Ville/Localisation *"
                          placeholder="Rechercher une ville..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <MapPin size={20} style={{ marginRight: 8, color: '#666' }} />
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Adresse détaillée"
                      value={formData.locationDetails}
                      onChange={(e) => handleInputChange('locationDetails', e.target.value)}
                      placeholder="Numéro, rue, étage, code d'accès, etc."
                      helperText="Informations pour faciliter l'accès au professionnel"
                    />
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Accès au site</InputLabel>
                      <Select
                        value={formData.access}
                        onChange={(e) => handleInputChange('access', e.target.value)}
                      >
                        <MenuItem value="normal">Accès normal</MenuItem>
                        <MenuItem value="restricted">Accès restreint (badge/code)</MenuItem>
                        <MenuItem value="full">Accès complet 24/7</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Matériaux fournis par</InputLabel>
                      <Select
                        value={formData.materials}
                        onChange={(e) => handleInputChange('materials', e.target.value)}
                      >
                        <MenuItem value="client">Client (vous fournissez)</MenuItem>
                        <MenuItem value="worker">Professionnel (inclus)</MenuItem>
                        <MenuItem value="shared">Partagé (à discuter)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Step 3: Budget & Planning */}
            <Card elevation={2} id="step-budget-planning">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DollarSign size={20} />
                  Budget & Planning
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ width: { xs: '100%', md: '31%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Type de budget</InputLabel>
                      <Select
                        value={formData.budgetType}
                        onChange={(e) => handleInputChange('budgetType', e.target.value)}
                      >
                        <MenuItem value="fixed">Prix fixe</MenuItem>
                        <MenuItem value="hourly">Tarif horaire</MenuItem>
                        <MenuItem value="daily">Tarif journalier</MenuItem>
                        <MenuItem value="project">Prix du projet</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '31%' } }}>
                    <TextField
                      fullWidth
                      type="number"
                      label={`Budget minimum (${formData.currency})`}
                      value={formData.budgetMin}
                      onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '31%' } }}>
                    <TextField
                      fullWidth
                      type="number"
                      label={`Budget maximum (${formData.currency})`}
                      value={formData.budgetMax}
                      onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Durée estimée du projet
                    </Typography>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Durée estimée"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Unité</InputLabel>
                      <Select
                        value={formData.durationUnit}
                        onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                      >
                        <MenuItem value="hours">Heures</MenuItem>
                        <MenuItem value="days">Jours</MenuItem>
                        <MenuItem value="weeks">Semaines</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Dates souhaitées
                    </Typography>
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date de début souhaitée"
                      value={formData.preferredStartDate}
                      onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date de fin souhaitée"
                      value={formData.preferredEndDate}
                      onChange={(e) => handleInputChange('preferredEndDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Horaires préférés"
                      value={formData.preferredSchedule}
                      onChange={(e) => handleInputChange('preferredSchedule', e.target.value)}
                      placeholder="Ex: Matinées 9h-12h, Jours de semaine uniquement, etc."
                      helperText="Précisez vos disponibilités pour faciliter la planification"
                    />
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.recurring}
                          onChange={(e) => handleInputChange('recurring', e.target.checked)}
                        />
                      }
                      label="Ceci est un projet récurrent/régulier"
                    />
                  </Box>

                  {formData.recurring && (
                    <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                      <FormControl fullWidth>
                        <InputLabel>Fréquence</InputLabel>
                        <Select
                          value={formData.recurringFrequency}
                          onChange={(e) => handleInputChange('recurringFrequency', e.target.value)}
                        >
                          <MenuItem value="daily">Quotidienne</MenuItem>
                          <MenuItem value="weekly">Hebdomadaire</MenuItem>
                          <MenuItem value="biweekly">Bihebdomadaire</MenuItem>
                          <MenuItem value="monthly">Mensuelle</MenuItem>
                          <MenuItem value="quarterly">Trimestrielle</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Step 4: Specific Requirements */}
            <Card elevation={2} id="step-specific-requirements">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings size={20} />
                  Exigences spécifiques
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Exigences techniques et qualifications"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Certifications requises, expériences spécifiques, outils particuliers, normes à respecter..."
                      helperText="Aidez les professionnels à comprendre vos besoins exacts"
                    />
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Instructions spéciales"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      placeholder="Consignes particulières, contraintes, points d'attention..."
                    />
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Certifications souhaitées
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['Qualibat', 'RGE', 'Certibat', 'FFB', 'CAP', 'BTP', 'Artisan'].map((cert) => (
                        <Chip
                          key={cert}
                          label={cert}
                          clickable
                          color={formData.certifications.includes(cert) ? 'primary' : 'default'}
                          onClick={() => {
                            const newCerts = formData.certifications.includes(cert)
                              ? formData.certifications.filter(c => c !== cert)
                              : [...formData.certifications, cert];
                            handleInputChange('certifications', newCerts);
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Préférence de contact
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        value={formData.contactPreference}
                        onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                      >
                        <FormControlLabel value="phone" control={<Radio />} label="Téléphone prioritaire" />
                        <FormControlLabel value="email" control={<Radio />} label="Email prioritaire" />
                        <FormControlLabel value="both" control={<Radio />} label="Les deux" />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Upload size={20} />
                  Pièces jointes
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    id="attachment-upload"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="attachment-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload size={16} />}
                      sx={{ mr: 2 }}
                    >
                      Ajouter des fichiers
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary">
                    Formats acceptés: Images, PDF, Documents Word/Excel. Max 10MB par fichier.
                  </Typography>
                </Box>

                {attachments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Fichiers sélectionnés:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`}
                          onDelete={() => removeAttachment(index)}
                          size="small"
                          variant="outlined"
                          color={file.size > 10 * 1024 * 1024 ? 'error' : 'default'}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Créer la demande'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDemandeDialog;