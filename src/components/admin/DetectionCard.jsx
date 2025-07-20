import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import moment from 'moment';

const DetectionCard = ({ roll_number, created_by, created_at, screenshots, total_detections }) => {
  return (
    <Card>
      <CardMedia
        component="img"
        height="140"
        image={screenshots?.[0] || 'https://via.placeholder.com/300'}
        alt="Screenshot"
      />
      <CardContent>
        <Typography variant="h6">Roll #: {roll_number}</Typography>
        <Typography variant="body2">
          By: {created_by} | Detections: {total_detections}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {moment(created_at).fromNow()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DetectionCard;
