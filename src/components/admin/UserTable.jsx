import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Switch,
  Typography,
} from '@mui/material';

// Dummy users
const dummyUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    roll_number: null,
    is_active: true,
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@student.com',
    role: 'student',
    roll_number: 'STU-001',
    is_active: true,
  },
  {
    id: 3,
    username: 'jane_general',
    email: 'jane@general.com',
    role: 'general',
    roll_number: null,
    is_active: false,
  },
];

const UserTable = ({ search, roleFilter }) => {
  // Filtered users
  const filtered = dummyUsers.filter((user) => {
    const matchSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.roll_number?.toLowerCase() || '').includes(search.toLowerCase());

    const matchRole = roleFilter ? user.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  return (
    <Paper sx={{ width: '100%', overflowX: 'auto' }}>
      {filtered.length === 0 ? (
        <Typography p={3}>No users found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Roll No</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.roll_number || '-'}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.is_active}
                    color="primary"
                    // Later: Add toggle logic here
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default UserTable;
