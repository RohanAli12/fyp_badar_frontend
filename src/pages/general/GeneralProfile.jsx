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
  People as GeneralUserIcon,
  Edit as EditIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useUserProfile } from '../../api/mutation';

const GeneralProfile = () => {
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
        <GeneralUserIcon fontSize="large" color="primary" />
        User Profile
      </Typography>

      <Paper 
        sx={{ 
          p: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, #f5f5f5)`,
          borderLeft: `4px solid ${theme.palette.primary.main}`
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
                  bgcolor: theme.palette.primary.main,
                  fontSize: 40
                }}
              >
                <VerifiedIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {profile?.username}
                </Typography>
                <Chip
                  label={profile?.role}
                  color="primary"
                  size="small"
                  icon={<GeneralUserIcon />}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.primary.main,
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
                    color: theme.palette.primary.main,
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
                <GeneralUserIcon 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.primary.main,
                    fontSize: 30
                  }} 
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="h6">
                    Standard User Access
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

export default GeneralProfile;