import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Container,
  CssBaseline,
  Avatar,
  Grid,
  Link,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useStudentSignupMutation } from '../../api/mutation';
import { PersonAddOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

const StudentSignupPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mutate, isPending } = useStudentSignupMutation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/login');
    }
  }, [navigate]);

  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    roll_number: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});
    mutate(form, {
      onSuccess: () => navigate('/login'),
      onError: (error) => {
        if (error?.error) {
          setFormErrors(error.error);
        }
      },
    });
  };

  return (
    <Container 
      component="main" 
      maxWidth={isMobile ? 'sm' : 'lg'} // Changed to 'lg' for more horizontal space
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        bgcolor: '#f9fafb'
      }}
    >
      <CssBaseline />
      <Paper 
        elevation={isMobile ? 0 : 4} 
        sx={{ 
          width: '100%',
          overflow: 'hidden',
          borderRadius: 4,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          bgcolor: 'background.paper',
          boxShadow: isMobile ? 'none' : '0px 10px 25px rgba(0, 0, 0, 0.05)',
          border: isMobile ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
          maxHeight: isMobile ? 'auto' : '80vh' // Limit height on desktop
        }}
      >
        {/* Left section with branding - now takes less space */}
        {!isMobile && (
          <Box
            sx={{
              width: '40%', // Reduced from flex:1 to fixed width
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
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
              zIndex: 1,
              textAlign: 'center'
            }}>
              <Avatar sx={{ 
                m: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 70,
                height: 70,
                backdropFilter: 'blur(5px)'
              }}>
                <PersonAddOutlined sx={{ fontSize: 30, color: '#fff' }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                Join <Box component="span" sx={{ color: '#f6e05e' }}>Now</Box>
              </Typography>
              <Typography variant="body1" sx={{ 
                lineHeight: 1.5,
                mb: 3
              }}>
                Register once for seamless attendance tracking
              </Typography>
            </Box>
          </Box>
        )}

        {/* Right section with form - now more compact */}
        <Box
          sx={{
            flex: 1,
            p: isMobile ? 3 : 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowY: 'auto', // Enable scrolling if content is too long
            maxHeight: isMobile ? 'auto' : '80vh'
          }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {isMobile && (
              <Avatar sx={{ 
                m: 1, 
                bgcolor: 'primary.main',
                width: 60,
                height: 60
              }}>
                <PersonAddOutlined sx={{ fontSize: 30 }} />
              </Avatar>
            )}
            <Typography component="h1" variant="h4" fontWeight={700}>
              Student Registration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Fill in your details to get started
            </Typography>
          </Box>

          {formErrors?.non_field_errors && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
              }}
            >
              {formErrors.non_field_errors[0]}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  error={!!formErrors.first_name}
                  helperText={formErrors.first_name?.[0]}
                  size="small"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  error={!!formErrors.last_name}
                  helperText={formErrors.last_name?.[0]}
                  size="small"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username?.[0]}
                  size="small"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Roll Number"
                  name="roll_number"
                  value={form.roll_number}
                  onChange={handleChange}
                  error={!!formErrors.roll_number}
                  helperText={formErrors.roll_number?.[0]}
                  size="small"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password?.[0]}
                  size="small"
                  InputProps={{
                    sx: { borderRadius: 2 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword(prev => !prev)} 
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
              }}
              disabled={isPending}
            >
              {isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              my: 2
            }}>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                or
              </Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              gap: 2
            }}>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                textAlign: 'center',
                alignSelf: 'center'
              }}>
                Already registered?
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none'
                }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentSignupPage;