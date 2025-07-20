import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Paper,
  Divider,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Security as DetectionsIcon,
  TrendingUp as StatsIcon,
  EmojiEvents as PerformanceIcon
} from '@mui/icons-material';
import { useAdminUsers, useAdminDetections } from '../../api/mutation';

const Dashboard = () => {
  const theme = useTheme();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: detData, isLoading: detLoading } = useAdminDetections();

  const usersCount = Array.isArray(usersData?.results)
    ? usersData.results.length
    : Array.isArray(usersData)
    ? usersData.length
    : 0;

  const detCount = Array.isArray(detData?.results)
    ? detData.results.length
    : Array.isArray(detData)
    ? detData.length
    : 0;

  const stats = [
    {
      title: "Total Users",
      value: usersCount,
      icon: <PeopleIcon fontSize="large" />,
      color: "linear-gradient(135deg, #f48fb1, #f8bbd0)",
      progress: 75,
      loading: usersLoading
    },
    {
      title: "Total Detections",
      value: detCount,
      icon: <DetectionsIcon fontSize="large" />,
      color: "linear-gradient(135deg, #ba68c8, #ce93d8)",
      progress: 60,
      loading: detLoading
    },
    {
      title: "System Performance",
      value: "Excellent",
      icon: <PerformanceIcon fontSize="large" />,
      color: "linear-gradient(135deg, #66bb6a, #81c784)",
      progress: 90,
      loading: false
    },
    {
      title: "Accuracy Rate",
      value: "98.5%",
      icon: <StatsIcon fontSize="large" />,
      color: "linear-gradient(135deg, #29b6f6, #4fc3f7)",
      progress: 98,
      loading: false
    }
  ];

  const StatCard = ({ title, value, icon, color, progress, loading }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        backgroundImage: color,
        backgroundSize: '200% 200%',
        animation: 'gradient 6s ease infinite',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 25px rgba(0,0,0,0.2)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255,255,255,0.3)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            p: 1,
            borderRadius: '50%',
            mr: 2,
            display: 'flex',
          }}>
            {icon}
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        ) : (
          <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mb: 2 }}>
            {value}
          </Typography>
        )}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              bgcolor: '#fff',
            },
          }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: '#333',
      }}>
        Admin Dashboard Overview
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#555', mb: 2 }}>
        Welcome back! Here's what's happening with your system today.
      </Typography>
      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{
        p: 3,
        mt: 4,
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>
          Recent Activity
        </Typography>
        <Typography sx={{ color: '#666' }}>
          Activity feed will appear here
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
