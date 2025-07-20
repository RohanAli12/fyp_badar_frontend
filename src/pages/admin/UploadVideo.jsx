import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  useTheme
} from '@mui/material';
import { VideoFile } from '@mui/icons-material';
import { useAdminVideoUpload } from '../../api/mutation';

const UploadVideo = () => {
  const theme = useTheme();
  const [rollNumber, setRollNumber] = useState('');
  const [video, setVideo] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedRollNumber, setSubmittedRollNumber] = useState('');

  const { mutate, isPending, isError, isSuccess, error } = useAdminVideoUpload();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('roll_number', rollNumber);
    formData.append('video', video);

    mutate(formData, {
      onSuccess: (data) => {
        setSuccessMsg('Video uploaded successfully!');
        setSubmittedRollNumber(rollNumber);
        setResponseData(data?.detection_data);
        setRollNumber('');
        setVideo(null);
      },
    });
  };

  const hasDetections =
    responseData?.status === 'success' &&
    Array.isArray(responseData?.data?.detections) &&
    responseData.data.detections.length > 0;

  const detectedScreenshots =
    hasDetections &&
    responseData.data.detections
      .map((det) => det.screenshot_file)
      .filter(Boolean)
      .map((filepath) => ({
        filepath,
        url: `http://127.0.0.1:8000${filepath}`,
      }));

  return (
    <Box maxWidth={600} mx="auto">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Upload Detection Video
      </Typography>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Stack spacing={3}>
          {isError && (
            <Alert severity="error">
              {error?.response?.data?.message || 'Upload failed. Please try again.'}
            </Alert>
          )}

          {successMsg && <Alert severity="success">{successMsg}</Alert>}

          {responseData && (
            <Alert severity={hasDetections ? 'success' : 'warning'}>
              {hasDetections
                ? 'Detections found successfully.'
                : `No detections found — roll number "${submittedRollNumber}" was not detected in the video.`}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Roll Number"
                fullWidth
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />

              <label htmlFor="video-upload">
                <input
                  id="video-upload"
                  type="file"
                  accept=".mp4,.avi,.mov,.mkv,.wmv"
                  style={{ display: 'none' }}
                  onChange={(e) => setVideo(e.target.files[0])}
                />
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<VideoFile />}
                >
                  Choose Video
                </Button>
              </label>

              <Button
                type="submit"
                variant="contained"
                disabled={isPending || !video}
                startIcon={isPending && <CircularProgress size={18} />}
              >
                {isPending ? 'Uploading...' : 'Upload Video'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>

      {hasDetections && (
        <Box mt={5}>
          <Typography variant="h6" gutterBottom>
            Detected Screenshots
          </Typography>

          {detectedScreenshots && detectedScreenshots.length > 0 ? (
            <Grid container spacing={2}>
              {detectedScreenshots.map((ss, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={ss.url}
                      alt={ss.filepath}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No screenshots available.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UploadVideo;
