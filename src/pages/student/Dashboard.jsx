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
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Stack,
  Button
} from '@mui/material';
import {
  Face as FaceIcon,
  CameraAlt as CameraIcon,
  VideoLibrary as VideoIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  CalendarToday as DateIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useStudentDetections } from '../../api/mutation';

const StudentDashboard = () => {
  const theme = useTheme();
  const { 
    data: detections, 
    isLoading: detLoading, 
    isError, 
    error, 
    refetch 
  } = useStudentDetections();
  
  // Process detection data for stats
  const totalDetections = detections?.detections?.length || 0;
  const recentDetections = detections?.detections?.slice(0, 5) || [];
  const lastDetection = recentDetections[0];

  // Determine role - default to 'user' if not specified
  const getDetectionRole = (detection) => {
    return detection.created_by_role || 
           (detection.created_by_name?.toLowerCase().includes('admin') ? 'admin' : 'user');
  };

  // Calculate admin vs general user detections
  const adminDetections = detections?.detections?.filter(d => getDetectionRole(d) === 'admin').length || 0;
  const userDetections = totalDetections - adminDetections;

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('File not found');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download: ${filename}`);
    }
  };

  const handleDownloadScreenshots = (screenshots) => {
    if (!Array.isArray(screenshots) || screenshots.length === 0) return;

    screenshots.forEach((relativeUrl) => {
      const fullUrl = `http://127.0.0.1:8000${relativeUrl}`;
      const parts = relativeUrl.split('/');
      const filename = parts[parts.length - 1];
      downloadFile(fullUrl, filename);
    });
  };

  const stats = [
  {
    title: "Total Recognitions",
    value: totalDetections,
    icon: <CameraIcon />,
    color: "linear-gradient(135deg, #ba68c8, #ce93d8)", // purple-lavender
    loading: detLoading
  },
  {
    title: "Admin Recognitions",
    value: adminDetections,
    icon: <AdminIcon />,
    color: "linear-gradient(135deg, #66bb6a, #81c784)", // green
    loading: detLoading
  },
  {
    title: "General Recognitions",
    value: userDetections,
    icon: <UserIcon />,
    color: "linear-gradient(135deg, #29b6f6, #4fc3f7)", // blue-cyan
    loading: detLoading
  },
  {
    title: "Last Detection",
    value: lastDetection ? new Date(lastDetection.created_at).toLocaleDateString() : 'Never',
    icon: <DateIcon />,
    color: "linear-gradient(135deg, #f48fb1, #f8bbd0)", // pink-rose
    loading: detLoading
  }
];


const StatCard = ({ title, value, icon, color, loading }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundImage: color,
      backgroundSize: '200% 200%',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: 2,
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.2)'
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            p: 1,
            borderRadius: '50%',
            mr: 1,
            display: 'flex'
          }}
        >
          {React.cloneElement(icon, { fontSize: 'medium' })}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {loading ? (
        <Skeleton variant="rectangular" width="80px" height={32} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
      ) : (
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);


  return (
    <Box sx={{ flexGrow: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 0.5
          }}>
            Student Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {detLoading ? 'Loading your data...' : 
             totalDetections > 0 ? `You've been recognized ${totalDetections} times` : 
             'No recognition records yet'}
          </Typography>
        </Box>
        {/* <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refetch}
            disabled={detLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={detLoading || totalDetections === 0}
          >
            Export
          </Button> */}
        {/* </Stack> */}
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[2]
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Recognition History
          </Typography>
          <Chip 
            label={`Last ${recentDetections.length} records`} 
            size="small" 
            color="primary"
            variant="outlined"
          />
        </Stack>

        {detLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.response?.data?.error ||
              error?.response?.data?.message ||
              'Failed to load recognition data'}
          </Alert>
        ) : recentDetections.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No recognition records found for your account.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Recognized By</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Evidence</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentDetections.map((row, i) => {
                  const role = getDetectionRole(row);
                  const isAdmin = role === 'admin';
                  const screenshots = row.screenshots_list || 
                                   (row.screenshots_urls ? row.screenshots_urls.split(',') : []);

                  return (
                    <TableRow key={i} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: isAdmin 
                              ? theme.palette.primary.main 
                              : theme.palette.secondary.main,
                            fontSize: 14
                          }}>
                            {row.created_by_name?.charAt(0) || 'U'}
                          </Avatar>
                          <Typography variant="body2">
                            {row.created_by_name || 'System'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={isAdmin ? <AdminIcon fontSize="small" /> : <UserIcon fontSize="small" />}
                          label={isAdmin ? 'Admin' : 'General'}
                          color={isAdmin ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          {row.output_video_url && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VideoIcon />}
                              onClick={() => window.open(row.output_video_url, '_blank')}
                              sx={{ width: 'fit-content' }}
                            >
                              View Video
                            </Button>
                          )}
                          {screenshots.length > 0 && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ImageIcon />}
                              onClick={() => handleDownloadScreenshots(screenshots)}
                              sx={{ width: 'fit-content' }}
                            >
                              Download Screenshots ({screenshots.length})
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(row.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(row.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="text"
                          onClick={() => console.log('View details', row.id)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {recentDetections.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="text" 
            endIcon={<CameraIcon />}
            onClick={() => window.location.href = '/student/detections'}
          >
            View All Recognition Records
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default StudentDashboard;