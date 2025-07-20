import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  useTheme
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  Timeline as StatsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAdminDetections } from '../../api/mutation';

const Detections = () => {
  const theme = useTheme();
  const { data, isLoading, isError, error } = useAdminDetections();
  const [visibleCount, setVisibleCount] = useState(10); // initial records to show

  const rows = data?.results || [];

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
    } catch (err) {
      console.error('Download failed:', err);
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

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Admin Detections
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={50} />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {error?.response?.data?.message || 'Failed to load admin detection records.'}
        </Alert>
      ) : rows.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No detection records found.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 600 }}>Roll Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stats</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Video</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Screenshots</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(0, visibleCount).map((row) => {
                    const stats = row.stats ? JSON.parse(row.stats) : null;
                    const screenshots = Array.isArray(row.screenshots_list)
                      ? row.screenshots_list
                      : row.screenshots_urls?.split(',') ?? [];

                    return (
                      <TableRow key={row.id} hover>
                    <TableCell>
  <Avatar 
    sx={{ 
      bgcolor: theme.palette.primary.main,
      width: 40,
      height: 40,
      fontSize: 16
    }}
  >
    {row.roll_number || 'N/A'}
  </Avatar>
</TableCell>


                        <TableCell>
                          {stats ? (
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                <strong>Total:</strong> {stats.total_detections}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Confidence:</strong> {stats.confidence_score}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Duration:</strong> {stats.duration_detected}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Frames:</strong> {stats.frames_detected?.join(', ') || 'N/A'}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {row.video_url ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VideoIcon />}
                              onClick={() => window.open(row.video_url, '_blank')}
                            >
                              View Video
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {screenshots.length > 0 ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadScreenshots(screenshots)}
                            >
                              {`Download (${screenshots.length})`}
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Stack>
                            <Typography variant="body2">
                              {new Date(row.created_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(row.created_at).toLocaleTimeString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {visibleCount < rows.length && (
            <Box textAlign="center" mt={3}>
              <Button variant="contained" onClick={handleLoadMore}>
                Load More
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Detections;
