// src/pages/student/MyFace.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Input,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useUploadFace } from '../../api/mutation';

const MyFace = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { mutate, isPending, isError, error } = useUploadFace();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rollNumber || !image) return;

    const formData = new FormData();
    formData.append('roll_number', rollNumber);
    formData.append('image', image);

    mutate(formData, {
      onSuccess: () => {
        setSuccessMsg('Face uploaded successfully!');
        setRollNumber('');
        setImage(null);
        setPreviewUrl(null);
      },
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Upload / Update Face Record
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {isError && (
          <Alert severity="error">
            {error?.response?.data?.message || 'Failed to upload face'}
          </Alert>
        )}
        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Roll Number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Input
            type="file"
            inputProps={{ accept: 'image/*' }}
            onChange={handleImageChange}
            required
          />

          {previewUrl && (
            <Box mt={2}>
              <Typography variant="subtitle1">Preview:</Typography>
              <Avatar
                src={previewUrl}
                alt="Face Preview"
                sx={{ width: 120, height: 120 }}
              />
            </Box>
          )}

          <Box mt={2}>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? <CircularProgress size={24} /> : 'Submit Face'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default MyFace;
