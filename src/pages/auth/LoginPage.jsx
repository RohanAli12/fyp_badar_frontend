import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Link,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../api/mutation';

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mutate, isPending, isError, error } = useLoginMutation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) navigate(`/${role}`, { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form, {
      onSuccess: (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('username', data.user.username);
        navigate(`/${data.user.role}`, { replace: true });
      },
    });
  };

  return (
    <Grid container component="main" sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Left Panel - Visual Appeal */}
      {!isMobile && (
        <Grid
          item
          xs={false}
          sm={6}
          md={7}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: 6,
            py: 8,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              transform: 'rotate(30deg)',
            }
          }}
        >
          <Box sx={{ 
            maxWidth: 500, 
            zIndex: 1,
            textAlign: 'center',
            animation: 'fadeIn 1s ease-in-out'
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto',
              backdropFilter: 'blur(5px)'
            }}>
              <Box component="span" sx={{ 
                fontSize: 40,
                color: '#fff',
                lineHeight: 1
              }}>👋</Box>
            </Box>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Human <Box component="span" sx={{ color: '#f6e05e' }}>Identification</Box>
            </Typography>
            <Typography variant="h6" sx={{ 
              mb: 3,
              fontWeight: 400,
              opacity: 0.9
            }}>
              The smartest way to detect human 
            </Typography>
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              p: 3,
              borderRadius: 2,
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="body1" sx={{ 
                lineHeight: 1.7,
                fontStyle: 'italic',
                '&::before, &::after': {
                  content: '"\\""',
                  fontSize: 24,
                  color: '#f6e05e',
                  verticalAlign: 'middle',
                  lineHeight: 0
                }
              }}>
                Revolutionizing detection tracking with AI-powered facial recognition
              </Typography>
            </Box>
          </Box>
        </Grid>
      )}

      {/* Right Panel - Login Form */}
      <Grid 
        item 
        xs={12} 
        sm={6} 
        md={5} 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: isMobile ? 2 : 4
        }}
      >
        <Paper
          elevation={isMobile ? 0 : 4}
          sx={{
            width: '100%',
            maxWidth: 500,
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            boxShadow: isMobile ? 'none' : '0px 10px 25px rgba(0, 0, 0, 0.05)',
            border: isMobile ? 'none' : '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 60,
              height: 60,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              color: '#fff',
              fontSize: 28
            }}>
              <Box component="span">🔒</Box>
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              Sign In
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isMobile ? 'Welcome back!' : 'Please sign in to access your dashboard'}
            </Typography>
          </Box>

          {isError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                alignItems: 'center'
              }}
            >
              {error?.response?.data?.message || 'Invalid credentials. Please try again.'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              sx={{ mb: 2 }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' }
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              sx={{ mb: 1 }}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(prev => !prev)} 
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    color="primary" 
                    size="small" 
                    sx={{
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label="Remember me"
                sx={{ mt: 0 }}
              />
              <Link 
                href="#" 
                variant="body2" 
                underline="hover"
                onClick={() => navigate('/forgot-password')}
                sx={{ fontWeight: 500 }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 1, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
              disabled={isPending}
            >
              {isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider sx={{ my: 3, color: 'text.secondary' }}>or</Divider>

            {/* <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 2,
              mb: 3
            }}>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  flex: 1,
                  borderColor: 'divider',
                  color: 'text.primary'
                }}
                startIcon={<Box component="span">🔑</Box>}
              >
                SSO
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  flex: 1,
                  borderColor: 'divider',
                  color: 'text.primary'
                }}
                startIcon={<Box component="span">👤</Box>}
              >
                Guest
              </Button>
            </Box> */}

            <Typography variant="body2" sx={{ 
              textAlign: 'center',
              color: 'text.secondary',
              mt: 3
            }}>
              If you are student with don't have an account?{' '}
              <Link 
                component="button" 
                onClick={() => navigate('/signup')} 
                underline="hover"
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Create one
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LoginPage;