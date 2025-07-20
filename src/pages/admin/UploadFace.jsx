import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Stack,
  useTheme,
  Alert
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAdminRecordFace } from '../../api/mutation';

const UploadFace = () => {
  const theme = useTheme();
  const [rollNumber, setRollNumber] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const { mutate, isPending, isSuccess, isError, error, reset } = useAdminRecordFace();

  // Cleanup preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    reset(); // Reset previous success/error messages
    const formData = new FormData();
    formData.append('roll_number', rollNumber);
    formData.append('image', image);
    mutate(formData);
  };

  return (
    <Box maxWidth={500} mx="auto">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Upload Face Record
      </Typography>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[3],
          backgroundColor: theme.palette.background.paper
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Roll Number"
              fullWidth
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />

            <label htmlFor="face-upload">
              <input
                id="face-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Choose Image
              </Button>
            </label>

            {preview && (
              <Box textAlign="center">
                <Avatar
                  src={preview}
                  sx={{ width: 120, height: 120, mx: 'auto', border: '3px solid #ccc' }}
                />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isPending || !image}
            >
              {isPending ? 'Uploading...' : 'Upload Face'}
            </Button>

            {isSuccess && (
              <Alert severity="success">Face uploaded successfully!</Alert>
            )}
            {isError && (
              <Alert severity="error">
                {error?.message || 'Upload failed. Please try again.'}
              </Alert>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default UploadFace;
