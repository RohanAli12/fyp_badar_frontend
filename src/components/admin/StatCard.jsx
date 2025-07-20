import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, count, color }) => {
  return (
    <Card sx={{ backgroundColor: color, color: '#fff' }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Box display="flex" justifyContent="flex-end">
          <Typography variant="h4">{count}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
