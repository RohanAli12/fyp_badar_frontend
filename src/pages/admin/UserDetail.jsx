import React from 'react';
import { useParams } from 'react-router-dom';
import { useAdminUserDetail } from '../../api/mutation';
import { Box, Typography, Paper } from '@mui/material';

const UserDetail = () => {
  const { id } = useParams();
  const { data: user, isLoading } = useAdminUserDetail(id);

  if (isLoading) return <Typography>Loading user...</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>User Details</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography><strong>ID:</strong> {user.id}</Typography>
        <Typography><strong>Username:</strong> {user.username}</Typography>
        {/* <Typography><strong>Email:</strong> {user.email}</Typography> */}
        <Typography><strong>Role:</strong> {user.role}</Typography>
      </Paper>
    </Box>
  );
};

export default UserDetail;
