import React, { useState } from 'react';
import { Lock, User, Building, Wrench, Shield, ArrowLeft, Mail, Key } from 'lucide-react';
import Logo from './Logo';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { authService } from '../utils';
import { useTheme } from '../contexts/ThemeContext';

interface LoginProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  userRole,
  setUserRole,
  setIsLoggedIn,
}) => {
  const { isDarkMode } = useTheme();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authService.login(email, password, userRole);
      // Assuming successful login returns user data
      setIsLoggedIn(true);
    } catch (err: any) {
      console.error('Login error:', err.message || 'Erreur de connexion');
    }
  };

  const handleDemoLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setResetStep('email');
    setResetMessage('');
  };

  const handleResetBack = () => {
    if (resetStep === 'code') {
      setResetStep('email');
    } else if (resetStep === 'password') {
      setResetStep('code');
    } else {
      setShowForgotPassword(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetMessage('Code de réinitialisation envoyé à votre email');
      setResetStep('code');
    } catch (error) {
      setResetMessage('Erreur lors de l\'envoi du code');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (resetCode === '123456') { // Demo code
        setResetMessage('Code vérifié avec succès');
        setResetStep('password');
      } else {
        setResetMessage('Code incorrect');
      }
    } catch (error) {
      setResetMessage('Erreur lors de la vérification');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    if (newPassword !== confirmPassword) {
      setResetMessage('Les mots de passe ne correspondent pas');
      setResetLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setResetMessage('Le mot de passe doit contenir au moins 6 caractères');
      setResetLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetMessage('Mot de passe réinitialisé avec succès');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep('email');
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (error) {
      setResetMessage('Erreur lors de la réinitialisation');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: isDarkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)',
        color: 'text.primary',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Paper
            elevation={8}
            sx={{
              display: 'inline-flex',
              p: 2,
              mb: 2,
              background: isDarkMode
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              boxShadow: isDarkMode
                ? '0 20px 40px rgba(0,0,0,0.4)'
                : '0 20px 40px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Logo size={40} />
          </Paper>
          <Typography
            variant="h3"
            fontWeight={800}
            gutterBottom
            sx={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #e879f9 0%, #a855f7 50%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AlloBrico
          </Typography>
          <Typography color="text.secondary">
            Votre plateforme de services professionnels
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            gutterBottom
          >
            Connexion
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Adresse email"
                placeholder="vous@email.fr"
                required
                InputProps={{
                  startAdornment: (
                    <User size={18} style={{ marginRight: 8, opacity: 0.6 }} />
                  ),
                }}
              />

              <TextField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Mot de passe"
                placeholder="••••••••"
                required
                InputProps={{
                  startAdornment: (
                    <Lock size={18} style={{ marginRight: 8, opacity: 0.6 }} />
                  ),
                }}
              />

              <FormControl fullWidth>
                <InputLabel id="role-label">Type de compte</InputLabel>
                <Select
                  labelId="role-label"
                  value={userRole}
                  label="Type de compte"
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <MenuItem value="client">Client particulier</MenuItem>
                  <MenuItem value="worker">Artisan / Professionnel</MenuItem>
                  <MenuItem value="business">Entreprise</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                </Select>
              </FormControl>

              <Button type="submit" variant="contained" size="large">
                Se connecter
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" textAlign="center" gutterBottom>
            Accès démo instantané
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Button
              onClick={() => handleDemoLogin('client')}
              fullWidth
              variant="outlined"
              startIcon={<User size={18} />}
            >
              Client
            </Button>
            <Button
              onClick={() => handleDemoLogin('worker')}
              fullWidth
              variant="outlined"
              startIcon={<Wrench size={18} />}
            >
              Artisan
            </Button>
            <Button
              onClick={() => handleDemoLogin('business')}
              fullWidth
              variant="outlined"
              startIcon={<Building size={18} />}
            >
              Entreprise
            </Button>
            <Button
              onClick={() => handleDemoLogin('admin')}
              fullWidth
              variant="outlined"
              startIcon={<Shield size={18} />}
            >
              Admin
            </Button>
          </Box>

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="text" onClick={handleForgotPassword}>Mot de passe oublié ?</Button>
            <Button variant="text">Créer un compte</Button>
          </Stack>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Une plateforme pour particuliers, artisans et entreprises.
          </Typography>
        </Box>
      </Box>

      {/* Password Reset Dialog */}
      <Dialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            {resetStep !== 'email' && (
              <Button
                size="small"
                onClick={handleResetBack}
                startIcon={<ArrowLeft size={16} />}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                Retour
              </Button>
            )}
            <Typography variant="h6" fontWeight={600}>
              {resetStep === 'email' && 'Réinitialiser le mot de passe'}
              {resetStep === 'code' && 'Vérifier le code'}
              {resetStep === 'password' && 'Nouveau mot de passe'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {resetStep === 'email' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Entrez votre adresse email pour recevoir un code de réinitialisation.
                </Typography>
                <form onSubmit={handleSendResetCode}>
                  <TextField
                    fullWidth
                    label="Adresse email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <Mail size={18} style={{ marginRight: 8, color: 'gray' }} />,
                    }}
                  />
                </form>
              </>
            )}

            {resetStep === 'code' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Un code de 6 chiffres a été envoyé à {resetEmail}. Entrez-le ci-dessous.
                </Typography>
                <form onSubmit={handleVerifyCode}>
                  <TextField
                    fullWidth
                    label="Code de vérification"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                    inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                    InputProps={{
                      startAdornment: <Key size={18} style={{ marginRight: 8, color: 'gray' }} />,
                    }}
                  />
                </form>
              </>
            )}

            {resetStep === 'password' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Choisissez un nouveau mot de passe sécurisé.
                </Typography>
                <form onSubmit={handleResetPassword}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nouveau mot de passe"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Lock size={18} style={{ marginRight: 8, color: 'gray' }} />,
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Confirmer le mot de passe"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Lock size={18} style={{ marginRight: 8, color: 'gray' }} />,
                      }}
                    />
                  </Stack>
                </form>
              </>
            )}

            {resetMessage && (
              <Alert
                severity={resetMessage.includes('succès') || resetMessage.includes('envoyé') ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {resetMessage}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowForgotPassword(false)}>
            Annuler
          </Button>
          {resetStep === 'email' && (
            <Button
              onClick={handleSendResetCode}
              disabled={!resetEmail || resetLoading}
              startIcon={resetLoading ? <CircularProgress size={16} /> : <Mail size={16} />}
            >
              {resetLoading ? 'Envoi...' : 'Envoyer le code'}
            </Button>
          )}
          {resetStep === 'code' && (
            <Button
              onClick={handleVerifyCode}
              disabled={!resetCode || resetLoading}
              startIcon={resetLoading ? <CircularProgress size={16} /> : <Key size={16} />}
            >
              {resetLoading ? 'Vérification...' : 'Vérifier'}
            </Button>
          )}
          {resetStep === 'password' && (
            <Button
              onClick={handleResetPassword}
              disabled={!newPassword || !confirmPassword || resetLoading}
              startIcon={resetLoading ? <CircularProgress size={16} /> : <Lock size={16} />}
            >
              {resetLoading ? 'Réinitialisation...' : 'Réinitialiser'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
