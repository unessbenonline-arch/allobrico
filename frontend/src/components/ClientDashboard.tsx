import React from 'react';
import {
  MapPin,
  AlertCircle,
  Star,
  Users,
  Plus,
  Search,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Wrench,
  Zap,
  Palette,
  Hammer,
  Leaf,
  Snowflake,
  Flame,
  Home,
  MoreHorizontal,
  Settings,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, useMapEvents } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Card,
  CardContent,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { api, getCategoryIcon, getLocationCoordinates, getLocationString } from '../utils';
import { useRequests, useCategories, useWorkers } from '../stores/appStore';
import CreateDemandeDialog from './CreateDemandeDialog';

interface ClientDashboardProps {
  searchLocation: string;
  setSearchLocation: React.Dispatch<React.SetStateAction<string>>;
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
  showRequestForm: boolean;
  setShowRequestForm: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  isUrgent: boolean;
  setIsUrgent: React.Dispatch<React.SetStateAction<boolean>>;
}

// Icon mapping function for categories
const getCategoryIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Wrench":
      return <Wrench size={16} />;
    case "Zap":
      return <Zap size={16} />;
    case "Palette":
      return <Palette size={16} />;
    case "Hammer":
      return <Hammer size={16} />;
    case "Leaf":
      return <Leaf size={16} />;
    case "Snowflake":
      return <Snowflake size={16} />;
    case "Flame":
      return <Flame size={16} />;
    case "Home":
      return <Home size={16} />;
    case "MoreHorizontal":
      return <MoreHorizontal size={16} />;
    default:
      return <Settings size={16} />;
  }
};

// Custom marker component with category icons
const CustomMarker: React.FC<{
  worker: any;
  onClick: (worker: any) => void;
}> = ({ worker, onClick }) => {
  const map = useMap();

  const icon = L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      border: 3px solid #ffffff;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
      cursor: pointer;
      color: white;
      font-weight: bold;
      transition: all 0.3s ease;
    ">${getCategoryIcon(worker.specialty)}</div>`,
    className: 'custom-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  const position = getLocationCoordinates(worker.location);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onClick(worker);
        },
      }}
    />
  );
};

// Map event handler for location
const LocationHandler: React.FC<{
  onLocationFound?: (lat: number, lng: number) => void;
}> = ({ onLocationFound }) => {
  const map = useMapEvents({
    locationfound: (e) => {
      if (onLocationFound) {
        onLocationFound(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  searchLocation,
  setSearchLocation,
  selectedFilters,
  setSelectedFilters,
  showRequestForm,
  setShowRequestForm,
  selectedCategory,
  setSelectedCategory,
  description,
  setDescription,
  location,
  setLocation,
  isUrgent,
  setIsUrgent,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [selectedWorker, setSelectedWorker] = React.useState<any>(null);
  const [showWorkerProfile, setShowWorkerProfile] = React.useState(false);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [contactMessage, setContactMessage] = React.useState('');
  const [mapExpanded, setMapExpanded] = React.useState(false);
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([48.8566, 2.3522]);
  const [mapZoom, setMapZoom] = React.useState(12);
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);

  // Tab state for switching between finding workers and managing requests
  const [activeTab, setActiveTab] = React.useState(1); // 0 = Find workers, 1 = My requests
  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);
  const [showOffersModal, setShowOffersModal] = React.useState(false);
  const [requestOffers, setRequestOffers] = React.useState<any[]>([]);

  // Use Zustand store for requests and categories
  const { requests: clientRequests, isLoading: isLoadingRequests, fetchRequests, createRequest, updateRequest } = useRequests();
  const { categories, fetchCategories } = useCategories();
  const { workers, fetchWorkers } = useWorkers();

  // Handle map resize when expanded state changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [mapExpanded]);
  const filters = [
    { id: 'urgent', label: 'Disponible maintenant', icon: '⚡' },
    { id: 'highly_rated', label: 'Très bien noté', icon: '⭐' },
    { id: 'company', label: 'Entreprise', icon: '🏢' },
    { id: 'individual', label: 'Artisan', icon: '👤' },
    { id: 'weekend', label: 'Weekend', icon: '📅' },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev: string[]) =>
      prev.includes(filterId)
        ? prev.filter((f: string) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const filteredWorkers = workers.filter((w) => {
    // Always check status first - allow available or busy workers
    let matches = w.status === 'available' || w.status === 'busy';

    // Apply category filter
    if (selectedCategory && selectedCategory !== '') {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category && category.name && w.specialty) {
        matches = matches && w.specialty.toLowerCase().includes(category.name.toLowerCase());
      }
    }

    // Apply status filters
    if (selectedFilters.includes('urgent')) matches = matches && w.urgent;
    if (selectedFilters.includes('highly_rated'))
      matches = matches && w.rating >= 4.7;
    if (selectedFilters.includes('company'))
      matches = matches && w.type === 'company';
    if (selectedFilters.includes('individual'))
      matches = matches && w.type === 'artisan';

    return matches;
  });

  // Worker profile dialog state
  const [openProfile, setOpenProfile] = React.useState(false);
  const [profileData, setProfileData] = React.useState<any | null>(null);

  const openWorkerProfile = async (workerId: string) => {
    try {
      // For demo purposes, find worker from the workers array
      const worker = workers.find(w => w.id === workerId);
      if (worker) {
        // Enhance worker data with more details for profile view
        const enhancedWorker = {
          ...(worker as any),
          description: (worker as any).description || "Artisan professionnel avec plusieurs années d'expérience dans son domaine. Spécialisé dans les travaux de qualité et les finitions soignées.",
          experience: (worker as any).experience || "5+ ans",
          certifications: (worker as any).certifications || ["Qualification professionnelle", "Assurance décennale"],
          portfolio: (worker as any).portfolio || [
            { id: 1, title: "Rénovation cuisine", image: "/api/placeholder/300/200", description: "Rénovation complète d'une cuisine moderne" },
            { id: 2, title: "Salle de bain", image: "/api/placeholder/300/200", description: "Installation salle de bain complète" },
          ],
          reviews: (worker as any).reviews || [
            { id: 1, client: "Marie D.", rating: 5, comment: "Excellent travail, très professionnel. Je recommande vivement.", date: "2024-01-15" },
            { id: 2, client: "Pierre L.", rating: 5, comment: "Ponctuel et travail de qualité. Prix raisonnable.", date: "2024-01-10" },
            { id: 3, client: "Sophie M.", rating: 4, comment: "Bon artisan, travail correct. Légèrement en retard sur le planning.", date: "2024-01-05" },
          ],
          availability: (worker as any).availability || "Disponible cette semaine",
          responseTime: (worker as any).responseTime || "Répond en moyenne en 2h",
          completedProjects: (worker as any).completedProjects || 47,
          specialties: (worker as any).specialties || ["Travaux de plomberie", "Dépannages urgents", "Installations"],
        };
        setSelectedWorker(enhancedWorker);
        setShowWorkerProfile(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishRequest = async () => {
    // Basic validation
    if (!selectedCategory) {
      alert('Veuillez sélectionner une catégorie de service');
      return;
    }
    if (!description.trim()) {
      alert('Veuillez décrire votre projet');
      return;
    }
    if (!location.trim() && !searchLocation.trim()) {
      alert('Veuillez indiquer l\'adresse du projet');
      return;
    }

    try {
      await createRequest({
        title: selectedCategory || 'Autre',
        description: description.trim(),
        category: selectedCategory || 'Autre',
        location: {
          address: (searchLocation || location).trim(),
        },
        isUrgent: isUrgent,
        clientId: 'client-anonyme', // TODO: Use actual client ID from auth
        status: 'pending',
      });

      // Reset form
      setSelectedCategory('');
      setDescription('');
      setLocation('');
      setSearchLocation('');
      setIsUrgent(false);
      setShowRequestForm(false);

      // Show success message
      alert('Votre demande a été publiée avec succès !');
    } catch (e) {
      console.error('Erreur lors de la publication:', e);
      alert('Une erreur est survenue lors de la publication de votre demande. Veuillez réessayer.');
    }
  };

  const handleContact = async (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setSelectedWorker(worker);
      setContactMessage('');
      setShowContactModal(true);
    }
  };

  const handleSendContactMessage = async () => {
    if (!selectedWorker || !contactMessage.trim()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowContactModal(false);
      setContactMessage('');
      // Could show success message here
    } catch (e) {
      console.error(e);
    }
  };

  // Load client requests, categories, and workers
  React.useEffect(() => {
    if (activeTab === 1) {
      fetchRequests();
    }
    fetchCategories();
    fetchWorkers();
  }, [activeTab, fetchRequests, fetchCategories, fetchWorkers]);

  const handleViewOffers = async (request: any) => {
    try {
      setSelectedRequest(request);
      
      // Fetch offers from API
      const response = await fetch(`/api/requests/${request.id}/offers`);
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }
      const data = await response.json();
      setRequestOffers(data.offers || []);
      setShowOffersModal(true);
    } catch (error) {
      console.error('Error loading offers:', error);
      setRequestOffers([]);
      setShowOffersModal(true);
    }
  };

  const handleOfferResponse = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      // Update offer status via API
      const response = await fetch(`/api/requests/${selectedRequest.id}/offers/${offerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update offer status');
      }

      const data = await response.json();
      
      // Update local state
      setRequestOffers(prev => 
        prev.map(offer => 
          offer.id === offerId ? { ...offer, status } : offer
        )
      );

      // If accepted, update the request status
      if (status === 'accepted') {
        await updateRequest(selectedRequest.id, {
          status: 'in-progress',
          workerId: requestOffers.find(o => o.id === offerId)?.workerId
        });
      }

      alert(`Offre ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès!`);
    } catch (error) {
      console.error('Error updating offer status:', error);
      alert('Erreur lors de la mise à jour de l\'offre');
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Modern Header Section */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ lg: 'flex-start' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Search size={28} /> Espace Client
            </Typography>
            <Typography color="text.secondary">
              Trouvez des professionnels ou gérez vos demandes
            </Typography>
          </Box>
          {activeTab === 0 && (
            <Button
              onClick={() => setShowRequestForm(!showRequestForm)}
              variant="contained"
              size="large"
              startIcon={<Plus size={18} />}
            >
              Nouvelle demande
            </Button>
          )}
        </Stack>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab 
              label="Trouver un professionnel" 
              icon={<Search size={16} />} 
              iconPosition="start"
            />
            <Tab 
              label="Mes demandes" 
              icon={<Clock size={16} />} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 300px 200px' },
              gap: 2,
            }}
          >
            <TextField
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Où se situe votre projet ? (ex: Paris 15ème, Versailles...)"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MapPin size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <Box>
              <FormControl fullWidth>
                <InputLabel id="cat-label">Catégorie</InputLabel>
                <Select
                  labelId="cat-label"
                  value={selectedCategory}
                  label="Catégorie"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Toutes catégories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Search size={16} />}
            >
              Rechercher
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Request Form Modal */}
      <CreateDemandeDialog
        open={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSuccess={() => {
          setShowRequestForm(false);
          fetchRequests(); // Refresh the requests list
        }}
        clientId="ba907e42-31e2-4d48-a108-2f07fe51fd19" // Marie Dubois - has requests
      />

      {/* Worker profile dialog */}
      <Dialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Profil du professionnel</DialogTitle>
        <DialogContent dividers>
          {profileData ? (
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={700}>
                {profileData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.specialty}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Star className="fill-yellow-400 text-yellow-400" size={16} />
                <Typography variant="body2" fontWeight={600}>
                  {profileData.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({profileData.jobs} avis)
                </Typography>
              </Stack>
              {profileData.profile && (
                <>
                  <Typography variant="body2">
                    Email: {profileData.profile.email}
                  </Typography>
                  <Typography variant="body2">
                    Téléphone: {profileData.profile.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profileData.profile.description}
                  </Typography>
                </>
              )}
            </Stack>
          ) : (
            <Typography>Chargement…</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenProfile(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Filtres
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {filters.map((filter) => (
            <Chip
              key={filter.id}
              label={`${filter.icon} ${filter.label}`}
              onClick={() => toggleFilter(filter.id)}
              color={
                selectedFilters.includes(filter.id) ? 'primary' : 'default'
              }
              variant={
                selectedFilters.includes(filter.id) ? 'filled' : 'outlined'
              }
            />
          ))}
        </Stack>
      </Box>

      {/* Main Content */}
      <div className={`${mapExpanded ? 'block' : 'md:flex'} gap-8 transition-all duration-700 ease-in-out`}>
        {/* Map Section */}
        <div className={`${mapExpanded ? 'w-full mb-8' : 'md:w-1/3 mb-8 md:mb-0'} transition-all duration-700 ease-in-out`}>
          <div className={`${mapExpanded ? '' : 'sticky top-4'} transition-all duration-700 ease-in-out`}>
            <Paper sx={{
              p: 2,
              mb: 2,
              overflow: 'hidden',
              transition: 'all 0.7s ease-in-out',
              width: '100%',
              maxWidth: '100%'
            }}>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={1} 
                gap={1}
                flexWrap="wrap"
              >
                <Typography 
                  fontWeight={600} 
                  sx={{ 
                    flexShrink: 0,
                    fontSize: '0.875rem'
                  }}
                >
                  Carte des professionnels
                </Typography>
                <Box
                  display="flex"
                  gap={0.5}
                  sx={{
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Eye size={14} />}
                    onClick={() => setMapExpanded(!mapExpanded)}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}
                  >
                    {mapExpanded ? 'Réduire' : 'Agrandir'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MapPin size={14} />}
                    onClick={() => {
                      if (filteredWorkers.length > 0) {
                        const coords = filteredWorkers.map(w => getLocationCoordinates(w.location));
                        const avgLat = coords.reduce((sum, [lat]) => sum + lat, 0) / coords.length;
                        const avgLng = coords.reduce((sum, [, lng]) => sum + lng, 0) / coords.length;
                        setMapCenter([avgLat, avgLng]);
                        setMapZoom(13);
                        // Animate to center
                        if (mapRef.current) {
                          (mapRef.current as any).flyTo([avgLat, avgLng], 13, {
                            duration: 1.5,
                            easeLinearity: 0.25,
                          });
                        }
                      }
                    }}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}
                  >
                    Centrer
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Search size={14} />}
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            console.log('User location:', latitude, longitude);
                            const newLocation: [number, number] = [latitude, longitude];
                            setUserLocation(newLocation);
                            setMapCenter(newLocation);
                            setMapZoom(14);

                            // Animate map to user location
                            if (mapRef.current) {
                              (mapRef.current as any).flyTo(newLocation, 14, {
                                duration: 2, // Animation duration in seconds
                                easeLinearity: 0.25,
                              });
                            }
                          },
                          (error) => {
                            console.error('Error getting location:', error);
                            alert('Impossible d\'obtenir votre position. Vérifiez les permissions de localisation.');
                          },
                          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
                        );
                      } else {
                        alert('La géolocalisation n\'est pas supportée par ce navigateur.');
                      }
                    }}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}
                  >
                    Me localiser
                  </Button>
                </Box>
              </Box>
                            <div
                style={{
                  height: mapExpanded ? 800 : 340,
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  transition: 'height 0.7s ease-in-out',
                  width: '100%',
                  position: 'relative',
                  minHeight: mapExpanded ? '800px' : '340px',
                }}
              >
                {/* Hide map attribution watermark */}
                <style>
                  {`
                    .leaflet-control-attribution {
                      display: none !important;
                    }
                  `}
                </style>
                <MapContainer
                  ref={mapRef}
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{
                    height: '100%',
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    minHeight: mapExpanded ? '800px' : '340px'
                  }}
                  zoomControl={true}
                  whenReady={() => {
                    // Force map to resize when expanded
                    setTimeout(() => {
                      window.dispatchEvent(new Event('resize'));
                    }, 100);
                  }}
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked={!isDarkMode} name="Carte moderne">
                      <TileLayer
                        attribution='© OpenMapTiles © OpenStreetMap contributors'
                        url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer checked={isDarkMode} name="Carte sombre">
                      <TileLayer
                        attribution='© OpenMapTiles © OpenStreetMap contributors'
                        url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Carte claire">
                      <TileLayer
                        attribution='© OpenMapTiles © OpenStreetMap contributors'
                        url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Carte détaillée">
                      <TileLayer
                        attribution='© OpenStreetMap contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Carte satellite">
                      <TileLayer
                        attribution='© OpenStreetMap contributors'
                        url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>
                  <LocationHandler
                    onLocationFound={(lat, lng) => {
                      setUserLocation([lat, lng]);
                    }}
                  />
                  {userLocation && (
                    <Marker position={userLocation} icon={L.divIcon({
                      html: `<div style="
                        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                        border: 3px solid #ffffff;
                        border-radius: 50%;
                        width: 44px;
                        height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
                        color: white;
                        font-weight: bold;
                      ">📍</div>`,
                      className: 'user-location-marker',
                      iconSize: [44, 44],
                      iconAnchor: [22, 44],
                    })}>
                      <Popup>Vous êtes ici</Popup>
                    </Marker>
                  )}
                  {filteredWorkers.map((w) => (
                    <CustomMarker
                      key={w.id}
                      worker={w}
                      onClick={(worker) => {
                        setSelectedWorker(worker);
                        setShowWorkerProfile(true);
                      }}
                    />
                  ))}
                </MapContainer>
              </div>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={600}>Résultats</Typography>
              <Typography variant="h3" color="primary">
                {filteredWorkers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                professionnels trouvés
              </Typography>
            </Paper>
          </div>
        </div>

        {/* Professionals List */}
        <div className={`${mapExpanded ? 'w-full' : 'md:w-2/3'} transition-all duration-700 ease-in-out`}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Users size={18} /> Professionnels disponibles
            </Typography>
            <FormControl size="small">
              <Select value="pertinence">
                <MenuItem value="pertinence">Trier par pertinence</MenuItem>
                <MenuItem value="note">Note la plus élevée</MenuItem>
                <MenuItem value="prix">Prix croissant</MenuItem>
                <MenuItem value="dispo">Disponibilité</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={2}>
            {filteredWorkers.map((worker) => (
              <Paper
                key={worker.id}
                sx={{
                  p: 2,
                  height: 'auto',
                  minHeight: 140,
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(25, 118, 210, 0.1)',
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.02)'
                  }
                }}
                onClick={() => openWorkerProfile(worker.id)}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'flex-start' }}
                  spacing={1.5}
                  sx={{ height: '100%' }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    <Avatar
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main'
                      }}
                    >
                      {worker.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 0.5, minWidth: 0, flexWrap: 'wrap' }}
                        >
                          <Typography
                            fontWeight={700}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: { xs: '100%', sm: 200 },
                            }}
                          >
                            {worker.name}
                          </Typography>
                          {worker.type === 'company' && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label="Entreprise"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                          {worker.urgent && (
                            <Chip size="small" color="error" label="Urgences" sx={{ fontSize: '0.7rem', height: 20 }} />
                          )}
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                            minHeight: '2.8em'
                          }}
                        >
                          {worker.specialty}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Star
                            className="fill-yellow-400 text-yellow-400"
                            size={14}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {worker.rating}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({worker.jobs})
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{ color: 'text.secondary' }}
                        >
                          <MapPin size={14} aria-hidden="true" />
                          <Typography variant="body2">À proximité</Typography>
                        </Stack>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Chip size="small" color="success" label="Disponible" sx={{ fontSize: '0.7rem', height: 20 }} />
                        <Typography variant="body2">
                          Répond en moyenne en 2h
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack
                    direction="column"
                    spacing={1}
                    sx={{
                      ml: { sm: 2 },
                      alignSelf: { xs: 'stretch', sm: 'flex-start' },
                      flexShrink: 0
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      aria-label={`Contacter ${worker.name}`}
                      sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
                      onClick={() => handleContact(worker.id)}
                    >
                      Contacter
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Eye size={14} />}
                      aria-label={`Voir le profil de ${worker.name}`}
                      sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
                      onClick={() => openWorkerProfile(worker.id)}
                    >
                      Profil
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>

          {filteredWorkers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <Typography variant="h6">Aucun professionnel trouvé</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Essayez de modifier vos filtres ou votre zone de recherche
              </Typography>
              <Button onClick={() => setSelectedFilters([])} variant="outlined">
                Réinitialiser les filtres
              </Button>
            </Box>
          )}
        </div>
      </div>

      {/* Worker Profile Modal */}
      <Dialog
        open={showWorkerProfile}
        onClose={() => setShowWorkerProfile(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedWorker && (
          <>
            {/* Enhanced Header with Profile Picture */}
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedWorker.name}`}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {selectedWorker.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Typography variant="h5" fontWeight={700}>
                      {selectedWorker.name}
                    </Typography>
                    {selectedWorker.type === 'company' && (
                      <Chip
                        label="Entreprise"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {selectedWorker.urgent && (
                      <Chip
                        label="Urgences 24/7"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 1 }}>
                    {selectedWorker.specialty}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Star className="fill-yellow-400 text-yellow-400" size={18} />
                      <Typography variant="body1" fontWeight={600}>
                        {selectedWorker.rating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({selectedWorker.jobs} avis)
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <MapPin size={16} />
                      <Typography variant="body2">
                        {getLocationString(selectedWorker.location)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
              <Stack spacing={4}>
                {/* Quick Stats */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                  <Card sx={{ minWidth: 120, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <CardContent sx={{ py: 2, px: 1 }}>
                      <CheckCircle size={28} style={{ margin: '0 auto 8px' }} />
                      <Typography variant="h5" fontWeight={700}>
                        {selectedWorker.completedProjects}
                      </Typography>
                      <Typography variant="caption">
                        Projets terminés
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 120, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                    <CardContent sx={{ py: 2, px: 1 }}>
                      <Clock size={28} style={{ margin: '0 auto 8px' }} />
                      <Typography variant="h5" fontWeight={700}>
                        {selectedWorker.responseTime}
                      </Typography>
                      <Typography variant="caption">
                        Temps de réponse
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 120, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                    <CardContent sx={{ py: 2, px: 1 }}>
                      <Award size={28} style={{ margin: '0 auto 8px' }} />
                      <Typography variant="h5" fontWeight={700}>
                        {selectedWorker.experience}
                      </Typography>
                      <Typography variant="caption">
                        Expérience
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 120, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                    <CardContent sx={{ py: 2, px: 1 }}>
                      <Users size={28} style={{ margin: '0 auto 8px' }} />
                      <Typography variant="h5" fontWeight={700}>
                        {selectedWorker.type === 'company' ? 'Équipe' : 'Indépendant'}
                      </Typography>
                      <Typography variant="caption">
                        Statut
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Divider />

                {/* About Section */}
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={20} />
                    À propos
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {selectedWorker.description}
                  </Typography>
                </Box>

                {/* Specialties */}
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Award size={20} />
                    Spécialités
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedWorker.specialties?.map((specialty: string, index: number) => (
                      <Chip
                        key={index}
                        label={specialty}
                        variant="filled"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Certifications */}
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle size={20} />
                    Certifications & Qualifications
                  </Typography>
                  <Stack spacing={1.5}>
                    {selectedWorker.certifications?.map((cert: string, index: number) => (
                      <Stack key={index} direction="row" alignItems="center" spacing={2}>
                        <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                        <Typography variant="body1" fontWeight={500}>{cert}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* Portfolio Preview */}
                {selectedWorker.portfolio && selectedWorker.portfolio.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Eye size={20} />
                      Portfolio récent ({selectedWorker.portfolio.length} projets)
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                      {selectedWorker.portfolio.slice(0, 6).map((item: any) => (
                        <Card key={item.id} sx={{ height: 140, position: 'relative', overflow: 'hidden' }}>
                          <Box
                            sx={{
                              height: '100%',
                              background: `linear-gradient(135deg, ${item.color || '#667eea'} 0%, ${item.color || '#764ba2'} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <Typography variant="body1" fontWeight={600} textAlign="center" sx={{ px: 2 }}>
                              {item.title}
                            </Typography>
                          </Box>
                          <Box sx={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
                            <Typography variant="caption" sx={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Reviews Section */}
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star size={20} />
                    Avis clients ({selectedWorker.reviews?.length || 0})
                  </Typography>
                  <Stack spacing={2}>
                    {selectedWorker.reviews?.slice(0, 4).map((review: any) => (
                      <Card key={review.id} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.client}`}
                              sx={{ width: 32, height: 32 }}
                            >
                              {review.client.charAt(0)}
                            </Avatar>
                            <Typography variant="body1" fontWeight={600}>
                              {review.client}
                            </Typography>
                          </Stack>
                          <Rating value={review.rating} readOnly size="small" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {new Date(review.date).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Card>
                    ))}
                  </Stack>
                </Box>

                {/* Availability & Contact Info */}
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Informations pratiques
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Clock size={18} style={{ color: '#f59e0b' }} />
                      <Typography variant="body1">
                        <strong>Disponibilité:</strong> {selectedWorker.availability}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <MessageCircle size={18} style={{ color: '#10b981' }} />
                      <Typography variant="body1">
                        <strong>Réponse moyenne:</strong> {selectedWorker.responseTime}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <MapPin size={18} style={{ color: '#ef4444' }} />
                      <Typography variant="body1">
                        <strong>Zone d'intervention:</strong> {getLocationString(selectedWorker.location)} et environs
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'space-between' }}>
              <Button
                onClick={() => setShowWorkerProfile(false)}
                variant="outlined"
                size="large"
                sx={{ minWidth: 120 }}
              >
                Fermer
              </Button>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setShowWorkerProfile(false);
                    handleContact(selectedWorker.id);
                  }}
                  sx={{ minWidth: 150 }}
                >
                  Contacter maintenant
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Contact Modal */}
      <Dialog
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedWorker && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {selectedWorker.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Contacter {selectedWorker.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedWorker.specialty}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>

            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="body2" color="text.secondary">
                  Envoyez un message à cet artisan pour discuter de votre projet. Il vous répondra généralement sous 2h.
                </Typography>

                <TextField
                  multiline
                  rows={4}
                  label="Votre message"
                  placeholder="Décrivez brièvement votre projet et vos besoins..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  fullWidth
                />

                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Informations de contact :
                  </Typography>
                  <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Mail size={16} />
                      <Typography variant="body2">Réponse par email</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Phone size={16} />
                      <Typography variant="body2">Appel possible après accord mutuel</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MessageCircle size={16} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                        }}
                        onClick={() => {
                          setShowWorkerProfile(false);
                          // Show message that chat is available in header
                          alert('💬 La messagerie est disponible dans le menu Messages en haut de la page');
                        }}
                      >
                        Discussion en temps réel disponible
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setShowContactModal(false)}>Annuler</Button>
              <Button
                variant="contained"
                onClick={handleSendContactMessage}
                disabled={!contactMessage.trim()}
              >
                Envoyer le message
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      </>
      )}

      {/* My Requests Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Mes demandes de service
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => {
                // Stay on current tab; just open dialog
                setShowRequestForm(true);
              }}
              size="small"
            >
              Nouvelle demande
            </Button>
          </Box>
          
          {clientRequests.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Aucune demande trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vous n'avez pas encore créé de demande de service.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setShowRequestForm(true)}
              >
                Créer ma première demande
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {clientRequests.map((request: any) => (
                <Paper key={request.id} sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {request.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                          {request.categoryIcon ? getCategoryIconComponent(request.categoryIcon) : null}
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{request.service}</Typography>
                        </Box>
                        {request.urgent && (
                          <Chip
                            label="Urgent"
                            color="error"
                            size="small"
                          />
                        )}
                        <Chip
                          label={
                            request.status === 'open' ? 'Ouverte' :
                            request.status === 'assigned' ? 'Assignée' :
                            request.status === 'in_progress' ? 'En cours' : 'Terminée'
                          }
                          color={
                            request.status === 'open' ? 'warning' :
                            request.status === 'assigned' ? 'info' :
                            request.status === 'in_progress' ? 'primary' : 'success'
                          }
                          size="small"
                        />
                      </Stack>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {request.description}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="body2">
                        <strong>Budget:</strong> {request.budget.min}€ - {request.budget.max}€
                      </Typography>
                      <Typography variant="body2">
                        <strong>Lieu:</strong> {getLocationString(request.location)}
                      </Typography>
                      {request.assignee && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Assigné à:</strong>
                          </Typography>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: 'grey.50',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'grey.100' }
                            }}
                            onClick={() => {
                              // Open worker profile
                              setSelectedWorker(request.assignee);
                              setOpenProfile(true);
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                src={request.assignee.avatar}
                                sx={{ width: 40, height: 40 }}
                              >
                                {request.assignee.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {request.assignee.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {request.assignee.specialty}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                  <Star className="fill-yellow-400 text-yellow-400" size={12} />
                                  <Typography variant="caption">
                                    {request.assignee.rating} ({request.assignee.jobs} jobs)
                                  </Typography>
                                  {request.status === 'in_progress' && (
                                    <Chip
                                      label="En cours"
                                      size="small"
                                      color="primary"
                                      sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </Paper>
                        </Box>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewOffers(request)}
                        disabled={request.status !== 'open'}
                      >
                        Voir offres ({request.offersCount})
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Offers Modal */}
      <Dialog
        open={showOffersModal}
        onClose={() => setShowOffersModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Offres pour: {selectedRequest?.title}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {requestOffers.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune offre reçue pour le moment.
              </Typography>
            ) : (
              requestOffers.map((offer: any) => (
                <Paper key={offer.id} sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {offer.workerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Offre reçue le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h5" fontWeight={700} color="primary">
                        {offer.price}€
                      </Typography>
                      <Chip
                        label={
                          offer.status === 'pending' ? 'En attente' :
                          offer.status === 'accepted' ? 'Acceptée' : 'Rejetée'
                        }
                        color={
                          offer.status === 'pending' ? 'warning' :
                          offer.status === 'accepted' ? 'success' : 'error'
                        }
                        size="small"
                      />
                    </Box>
                  </Stack>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {offer.description}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="body2">
                        <strong>Délai:</strong> {offer.timeline}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        <strong>Disponibilité:</strong> {offer.availability}
                      </Typography>
                    </Box>
                  </Stack>

                  {offer.status === 'pending' && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleOfferResponse(offer.id, 'accepted')}
                      >
                        Accepter l'offre
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleOfferResponse(offer.id, 'rejected')}
                      >
                        Rejeter l'offre
                      </Button>
                    </Stack>
                  )}
                </Paper>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOffersModal(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default ClientDashboard;
