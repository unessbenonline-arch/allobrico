import React, { useEffect } from 'react';
import './styles.css';
import Login from './components/Login';
import ClientDashboard from './components/ClientDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import BusinessDashboard from './components/BusinessDashboard';
import AdminDashboard from './components/AdminDashboard';
import CertificationPage from './components/CertificationPage';
import Logo from './components/Logo';
import Chat from './components/Chat';
import { Bell, LogOut, Moon, Sun, Check, X, GraduationCap, MessageCircle, LayoutDashboard } from 'lucide-react';
import { AppBar, Toolbar, Box, IconButton, Typography, Avatar, Container, Badge, Paper, useTheme as useMuiTheme, Popover, List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Chip, Divider, Button } from '@mui/material';
import { useAuthStore, useCategoriesStore, useWorkersStore, useRequestsStore } from './stores';
import { useAppStore } from './stores/appStore';
import { messageService, notificationsService, formatTimeAgo } from './utils';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const { isLoggedIn, userRole, setIsLoggedIn, setUserRole, user, hydrate, logout } = useAuthStore() as any;
  const { user: appUser, isAuthenticated, login: appLogin, register: appRegister, logout: appLogout } = useAppStore();
  const { fetchCategories } = useCategoriesStore();
  const { fetchWorkers } = useWorkersStore();
  const { fetchRequests, requests } = useRequestsStore();
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const [email, setEmail] = React.useState(() => localStorage.getItem('userEmail') || '');
  const [password, setPassword] = React.useState('');
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState([
    { id: 1, from: 'Pierre Martin', content: 'Bonjour, je peux intervenir demain matin pour la réparation.', time: '10 min', unread: true, conversationId: 'conv1' },
    { id: 2, from: 'Sophie Leroy', content: 'Le devis pour l\'installation électrique est prêt.', time: '1h', unread: true, conversationId: 'conv2' },
    { id: 3, from: 'Jean Dupont', content: 'J\'ai terminé les travaux de menuiserie.', time: '2h', unread: false, conversationId: 'conv3' }
  ]);
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [notificationAnchor, setNotificationAnchor] = React.useState<null | HTMLElement>(null);
  const [messageAnchor, setMessageAnchor] = React.useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = React.useState<'dashboard' | 'certification' | 'messages'>('dashboard');
  const [showChat, setShowChat] = React.useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = React.useState<string | null>(null);
  
  // Client space state variables
  const [searchLocation, setSearchLocation] = React.useState('');
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
  const [showRequestForm, setShowRequestForm] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [isUrgent, setIsUrgent] = React.useState(false);

  const { hydrate: appHydrate } = useAppStore();

  // Hydrate user session on mount
  useEffect(() => {
    appHydrate();
  }, [appHydrate]);

  // Persist login state changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userEmail', email);
  }, [isLoggedIn, userRole, email]);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchWorkers(),
          fetchRequests()
        ]);
      } catch (err: any) {
        console.error('Failed to load initial data', err);
      }
    };
    // Only load after we know auth state
    load();
  }, [fetchCategories, fetchWorkers, fetchRequests, isLoggedIn, userRole, user?.id]);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messageService.getConversations() as any[];
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (isLoggedIn) {
      fetchConversations();
    }
  }, [isLoggedIn]);

  const loadNotifications = React.useCallback(async () => {
    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, []);

  // Notifications: initial load, polling, and refresh on focus
  useEffect(() => {
    if (!isLoggedIn) return;
    let timer: number | undefined;

    // Initial fetch
    loadNotifications();

    // Poll every 30s
    timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    }, 30000);

    // Refresh on tab focus/visibility
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isLoggedIn, loadNotifications]);

  const handleLogout = async () => {
    await appLogout();
    setEmail('');
    setPassword('');
    setCurrentPage('dashboard');
    localStorage.removeItem('userEmail');
  };

  

  const handleNotificationClick = async (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
    await loadNotifications(); // Refresh immediately when opening
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMessageClick = (event: React.MouseEvent<HTMLElement>) => {
    setMessageAnchor(event.currentTarget);
  };

  const handleMessageClose = () => {
    setMessageAnchor(null);
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all notifications read', e);
    }
  };

  // Local hide (no backend delete endpoint yet)
  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadMessageCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (!isLoggedIn) {
    return (
      <Login
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        userRole={userRole}
        setUserRole={setUserRole}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />
    );
  }

  // Add stable demo IDs so dashboards relying on userProfile.id can query backend endpoints.
  // In a real implementation this would come from the authenticated user object.
  const userProfile = {
    id: appUser?.id || user?.id || 'unknown',
    name: appUser ? (appUser.name || `${appUser.firstName || ''} ${appUser.lastName || ''}`.trim() || appUser.email) : user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email) : 'Utilisateur',
    email: appUser?.email || user?.email || email,
    avatar: appUser ? (appUser.avatar || (appUser.firstName && appUser.lastName ? `${appUser.firstName[0]}${appUser.lastName[0]}`.toUpperCase() : (appUser.email?.slice(0,2) || 'U').toUpperCase())) : user ? (user.avatar || (user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : (user.email?.slice(0,2) || 'U').toUpperCase())) : 'U'
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: muiTheme.palette.mode === 'dark'
            ? '#1e293b'
            : '#ffffff',
          boxShadow: muiTheme.palette.mode === 'dark'
            ? '0 2px 10px rgba(0,0,0,0.2)'
            : '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3, md: 4 } }}>
          <Container
            maxWidth="xl"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 0,
              width: '100%'
            }}
          >
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                }}
              >
                <Logo size={32} />
              </Paper>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  AlloBrico
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                  }}
                >
            {(user?.role || userRole) === 'client' ? 'Espace Client' :
             (user?.role || userRole) === 'worker' ? 'Espace Artisan' :
             (user?.role || userRole) === 'business' ? 'Espace Entreprise' :
                   'Administration'}
                </Typography>
              </Box>
            </Box>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              {/* Formation/Messages Button for Workers */}
              {userRole === 'worker' && (
                <Button
                  variant={currentPage === 'certification' || currentPage === 'messages' ? 'contained' : 'outlined'}
                  startIcon={
                    currentPage === 'certification' ? <LayoutDashboard size={16} /> :
                    currentPage === 'messages' ? <LayoutDashboard size={16} /> :
                    <GraduationCap size={16} />
                  }
                  onClick={() => {
                    if (currentPage === 'certification' || currentPage === 'messages') {
                      setCurrentPage('dashboard');
                    } else {
                      setCurrentPage('certification');
                    }
                  }}
                  sx={{ mr: 1 }}
                >
                  {currentPage === 'certification' || currentPage === 'messages' ? 'Tableau de bord' : 'Formation'}
                </Button>
              )}

              {/* Messages Button */}
              <Badge
                badgeContent={unreadMessageCount}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    height: 18,
                    minWidth: 18,
                  }
                }}
              >
                <IconButton
                  onClick={handleMessageClick}
                  sx={{
                    backgroundColor: muiTheme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.04)',
                    p: 1.5,
                    color: 'text.primary',
                    mr: 1,
                    '&:hover': {
                      backgroundColor: muiTheme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <MessageCircle size={20} />
                </IconButton>
              </Badge>

              <IconButton
                onClick={handleNotificationClick}
                sx={{
                  backgroundColor: muiTheme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                  p: 1.5,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: muiTheme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.08)',
                  }
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: 18,
                      minWidth: 18,
                    }
                  }}
                >
                  <Bell size={20} />
                </Badge>
              </IconButton>

              <Box sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                textAlign: 'right',
                mr: 2,
                minWidth: 140
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.3
                  }}
                >
                  {userProfile.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.2
                  }}
                >
                  {userProfile.email}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 42,
                  height: 42,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: muiTheme.palette.mode === 'dark'
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {userProfile.avatar}
              </Avatar>

              {/* Dark Mode Toggle */}
              <IconButton
                onClick={toggleTheme}
                sx={{
                  backgroundColor: muiTheme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                  p: 1.5,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: muiTheme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.08)',
                  }
                }}
                title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>

              <IconButton
                onClick={handleLogout}
                sx={{
                  backgroundColor: muiTheme.palette.mode === 'dark'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(239, 68, 68, 0.04)',
                  p: 1.5,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: muiTheme.palette.mode === 'dark'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(239, 68, 68, 0.08)',
                  }
                }}
                title="Déconnexion"
              >
                <LogOut size={20} />
              </IconButton>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {currentPage === 'certification' ? (
          <CertificationPage userProfile={userProfile} />
        ) : currentPage === 'messages' ? (
          <Chat
            currentUser={{
              id: user?.id || ((userRole === 'client') ? 'client1' : 'worker1'),
              name: userProfile.name,
              type: (user?.role || userRole) as 'client' | 'worker'
            }}
            initialWorkerId={selectedWorkerId || undefined}
            onClose={() => {
              setCurrentPage('dashboard');
              setSelectedWorkerId(null);
            }}
          />
        ) : (
          (() => {
            switch (user?.role || userRole) {
              case 'client':
                return (
                  <ClientDashboard
                    searchLocation={searchLocation}
                    setSearchLocation={setSearchLocation}
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    showRequestForm={showRequestForm}
                    setShowRequestForm={setShowRequestForm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    description={description}
                    setDescription={setDescription}
                    location={location}
                    setLocation={setLocation}
                    isUrgent={isUrgent}
                    setIsUrgent={setIsUrgent}
                  />
                );
              case 'worker':
                return (
                  <WorkerDashboard
                    userProfile={userProfile}
                    notifications={notifications}
                    myRequests={requests}
                  />
                );
              case 'business':
                return (
                  <BusinessDashboard
                    userProfile={userProfile}
                    notifications={notifications}
                  />
                );
              case 'admin':
                return (
                  <AdminDashboard
                    userProfile={userProfile}
                    notifications={notifications}
                  />
                );
              default:
                return <div>Role not found</div>;
            }
          })()
        )}
      </Container>

      {/* Notification Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </Box>
        </Box>

        <List sx={{ py: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucune notification
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: !notification.is_read ? 'action.hover' : 'transparent',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: notification.type === 'offer.new' ? 'primary.main' :
                                notification.type === 'success' ? 'success.main' :
                                notification.type === 'warning' ? 'warning.main' :
                                notification.type === 'error' ? 'error.main' : 'info.main'
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={!notification.is_read ? 600 : 400}>
                        {notification.title ? notification.title : notification.message}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.created_at)}
                        </Typography>
                        {notification.type && (
                          <Chip
                            label={String(notification.type).replace(/\./g, ' ')}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.7rem', textTransform: 'none' }}
                          />
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {!notification.is_read && (
                      <IconButton size="small" onClick={() => markAsRead(notification.id)}>
                        <Check size={14} />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => deleteNotification(notification.id)}>
                      <X size={14} />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Button size="small" onClick={handleNotificationClose}>
              Fermer
            </Button>
          </Box>
        )}
      </Popover>

      {/* Message Popover */}
      <Popover
        open={Boolean(messageAnchor)}
        anchorEl={messageAnchor}
        onClose={handleMessageClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Messages
            </Typography>
            <Button size="small" onClick={() => {
              // Open messages page
              setMessageAnchor(null);
              setCurrentPage('messages');
            }}>
              Voir tout
            </Button>
          </Box>
        </Box>

        <List sx={{ py: 0 }}>
          {conversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucun message
              </Typography>
            </Box>
          ) : (
            conversations.slice(0, 5).map((conversation, index) => (
              <React.Fragment key={conversation.id}>
                <ListItem
                  sx={{
                    bgcolor: conversation.unreadCount > 0 ? 'action.hover' : 'transparent',
                    '&:hover': { bgcolor: 'action.selected' },
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    // Open conversation in messages page
                    setMessageAnchor(null);
                    setSelectedWorkerId(conversation.id);
                    setCurrentPage('messages');
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      {conversation.participants
                        .filter((p: any) => p.id !== (userRole === 'client' ? 'client1' : 'worker1'))
                        .map((p: any) => p.name.split(' ').map((n: string) => n[0]).join(''))
                        .join('')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={conversation.unreadCount > 0 ? 600 : 400}>
                          {conversation.participants
                            .filter((p: any) => p.id !== (userRole === 'client' ? 'client1' : 'worker1'))
                            .map((p: any) => p.name)
                            .join(', ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.lastMessage ? 
                            new Date(conversation.lastMessage.timestamp).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 
                            new Date(conversation.updatedAt).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          }
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {conversation.lastMessage ? conversation.lastMessage.content : 'Nouvelle conversation'}
                      </Typography>
                    }
                  />
                  {conversation.unreadCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={conversation.unreadCount}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  )}
                </ListItem>
                {index < conversations.slice(0, 5).length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>

        {conversations.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Button size="small" onClick={handleMessageClose}>
              Fermer
            </Button>
          </Box>
        )}
      </Popover>

      {/* Chat Component */}
      {showChat && (
        <Chat
          currentUser={{
            id: userRole === 'client' ? 'client1' : 'worker1',
            name: userProfile.name,
            type: userRole as 'client' | 'worker'
          }}
          initialWorkerId={selectedWorkerId || undefined}
          onClose={() => {
            setShowChat(false);
            setSelectedWorkerId(null);
          }}
        />
      )}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
