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
  VideoLibrary as VideoIcon,
  Security as DetectionsIcon,
  AccountCircle as ProfileIcon,
  TrendingUp as StatsIcon,
  EmojiEvents as PerformanceIcon
} from '@mui/icons-material';
import { useGeneralDetections } from '../../api/mutation';

const GeneralDashboard = () => {
  const theme = useTheme();
  const { data: detData, isLoading: detLoading } = useGeneralDetections();
  
  const detCount = detData?.count || 0;

  const stats = [
    {
      title: "Total Detections",
      value: detCount,
      icon: <DetectionsIcon />,
      color: "linear-gradient(135deg, #ba68c8, #ce93d8)",
      progress: Math.min(detCount * 10, 100),
      loading: detLoading
    },
    {
      title: "Upload Videos",
      value: "Upload",
      icon: <VideoIcon />,
      color: "linear-gradient(135deg, #66bb6a, #81c784)",
      progress: 0,
      loading: false,
      clickable: true,
      path: "/general/upload-video"
    },
    {
      title: "System Performance",
      value: "Excellent",
      icon: <PerformanceIcon />,
      color: "linear-gradient(135deg, #29b6f6, #4fc3f7)",
      progress: 90,
      loading: false
    },
    {
      title: "Accuracy Rate",
      value: "98.5%",
      icon: <StatsIcon />,
      color: "linear-gradient(135deg, #f48fb1, #f8bbd0)",
      progress: 98,
      loading: false
    }
  ];

  const StatCard = ({ title, value, icon, color, progress, loading, clickable, path }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        backgroundImage: color,
        backgroundSize: '200% 200%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': {
          transform: clickable ? 'translateY(-2px)' : 'none',
          boxShadow: clickable ? '0 6px 16px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(255,255,255,0.3)'
        }
      }}
      onClick={clickable ? () => window.location.href = path : undefined}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        position: 'relative', 
        zIndex: 1,
        p: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            p: 0.5,
            borderRadius: '50%',
            mr: 1,
            display: 'flex',
          }}>
            {React.cloneElement(icon, { fontSize: "medium" })}
          </Box>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        ) : (
          <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', mb: 1 }}>
            {value}
          </Typography>
        )}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 5,
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
      <Typography variant="h5" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: theme.palette.text.primary,
        mb: 1
      }}>
        General Dashboard
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
        Welcome back! Here's your activity summary.
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{
        p: 2,
        mt: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0px 2px 6px rgba(0,0,0,0.05)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
          Recent Activity
        </Typography>
        {detLoading ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : (
          detData?.results?.length > 0 ? (
            <Box>
              {detData.results.slice(0, 3).map((detection, i) => (
                <Box key={i} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {new Date(detection.timestamp).toLocaleString()} - {detection.status}
                  </Typography>
                  <Typography variant="body1">
                    {detection.video_name || 'Untitled detection'}
                  </Typography>
                  {i < detData.results.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: 'text.secondary' }}>
              No recent activity found
            </Typography>
          )
        )}
      </Paper>
    </Box>
  );
};

export default GeneralDashboard;