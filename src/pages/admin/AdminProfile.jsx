import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  useTheme,
  Chip,
  Skeleton,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useUserProfile } from '../../api/mutation';

const AdminProfile = () => {
  const theme = useTheme();
  const { data: profile, isLoading } = useUserProfile();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          fontWeight: 700,
          mb: 3,
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <AdminIcon fontSize="large" color="primary" />
        Administrator Profile
      </Typography>

      <Paper 
        sx={{ 
          p: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, #f0f4ff)`,
          borderLeft: `4px solid ${theme.palette.error.main}`
        }}
      >
        {isLoading ? (
          <>
            <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 3, borderRadius: 2 }} />
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="70%" height={40} />
            <Skeleton variant="text" width="50%" height={40} />
          </>
        ) : (
          <>
            <Stack direction="row" spacing={3} alignItems="center" mb={4}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: theme.palette.error.main,
                  fontSize: 40
                }}
              >
                <SecurityIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {profile?.username}
                </Typography>
                <Chip
                  label={`${profile?.role} (Elevated Access)`}
                  color="error"
                  size="small"
                  icon={<AdminIcon />}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BadgeIcon 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.error.main,
                    fontSize: 30
                  }} 
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="h6">
                    {profile?.username}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.error.main,
                    fontSize: 30
                  }} 
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="h6">
                    {profile?.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminIcon 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.error.main,
                    fontSize: 30
                  }} 
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Privileges
                  </Typography>
                  <Typography variant="h6">
                    Full System Access
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Divider sx={{ my: 4 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleDateString()}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                color="error"
              >
                Edit Profile
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AdminProfile;