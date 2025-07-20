import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import {
  useAdminGetUsers,
  useAdminUpdateUser,
  useAdminDeleteUser,
} from '../../api/mutation';

const AdminUserList = () => {
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteUserId, setDeleteUserId] = useState(null);

  const { data: users = [], isLoading, isError } = useAdminGetUsers(roleFilter);
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditData({ ...user });
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = () => {
    updateUser.mutate({ id: selectedUser.id, data: editData });
    setSelectedUser(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      if (!id) return console.warn('Invalid user ID');
deleteUser.mutate(id);

     
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Admin - Manage Users
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Filter by Role"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="general">General User</MenuItem>
            <MenuItem value="student">Student</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {isLoading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error" textAlign="center">
          Failed to load users.
        </Typography>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Username</TableCell>
                {/* <TableCell>Email</TableCell> */}
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user,index) => (
                  <TableRow key={user.id}>
                    <TableCell>{users.length - index}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    {/* <TableCell>{user.email}</TableCell>  */}
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.roll_number || '-'}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditOpen(user)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user.id)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {['username', 'first_name', 'last_name', 'role', 'roll_number'].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.replace('_', ' ').toUpperCase()}
              name={field}
              fullWidth
              value={editData[field] || ''}
              onChange={handleEditChange}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={updateUser.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserList;
