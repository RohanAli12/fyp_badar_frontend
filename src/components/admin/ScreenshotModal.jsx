import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ScreenshotModal = ({ open, images, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Screenshot Preview
        <IconButton onClick={onClose} sx={{ float: 'right' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {images.map((src, idx) => (
            <Grid item xs={6} md={4} key={idx}>
              <Box
                component="img"
                src={src}
                alt={`Screenshot ${idx + 1}`}
                sx={{ width: '100%', borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ScreenshotModal;
