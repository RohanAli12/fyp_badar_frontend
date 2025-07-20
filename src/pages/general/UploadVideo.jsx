import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  useTheme,
  Stack
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useGeneralVideoUpload } from '../../api/mutation';
import { useQueryClient } from '@tanstack/react-query';

const GeneralUpload = () => {
  const theme = useTheme();
  const [rollNumber, setRollNumber] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedRollNumber, setSubmittedRollNumber] = useState('');

  const { mutate, isPending, isError, error } = useGeneralVideoUpload();
  const queryClient = useQueryClient();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!videoFile) return;

    const formData = new FormData();
    formData.append('roll_number', rollNumber);
    formData.append('video', videoFile);

    mutate(formData, {
      onSuccess: (data) => {
        setSuccessMsg('Video uploaded successfully!');
        setSubmittedRollNumber(rollNumber);
        setResponseData(data?.detection_data);
        setRollNumber('');
        setVideoFile(null);
        queryClient.invalidateQueries(['general-detections']);
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
    <Box maxWidth={700} mx="auto">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Upload Video for Detection
      </Typography>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <form onSubmit={handleSubmit}>
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

            <TextField
              fullWidth
              label="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
            >
              {videoFile ? videoFile.name : 'Choose Video File'}
              <input
                type="file"
                hidden
                onChange={(e) => setVideoFile(e.target.files[0])}
                accept=".mp4,.avi,.mov,.mkv,.wmv"
              />
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isPending || !videoFile}
              startIcon={isPending && <CircularProgress size={18} />}
            >
              {isPending ? 'Uploading...' : 'Submit Video'}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Screenshots Section */}
      {hasDetections && (
        <Box mt={5}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Detected Screenshots
          </Typography>

          {detectedScreenshots.length > 0 ? (
            <Grid container spacing={2}>
              {detectedScreenshots.map((ss, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={ss.url}
                      alt={`Screenshot ${idx + 1}`}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary" mt={2}>
              No screenshots available.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default GeneralUpload;
