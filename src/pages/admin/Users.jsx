import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { useAdminCreateUserMutation } from '../../api/mutation';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'general', label: 'General User' },
  { value: 'student', label: 'Student' },
];

const Users = () => {
  const [form, setForm] = useState({
    username: '',
  
    password: '',
    first_name: '',
    last_name: '',
    role: 'general',
    roll_number: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const { mutate, isPending, isSuccess, isError, error } = useAdminCreateUserMutation();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = { ...form };

    if (userData.role === 'student') {
      if (!userData.roll_number.trim()) {
        setFormErrors({ roll_number: 'Roll number is required for students' });
        return;
      }
    } else {
      delete userData.roll_number;
    }

    if (userData.role !== 'student') {
      delete userData.role; // Let backend assign default roles for admin/general
    }

    mutate(userData, {
      onSuccess: () => {
        setForm({
          username: '',
         
          password: '',
          first_name: '',
          last_name: '',
          role: 'general',
          roll_number: '',
        });
      },
      onError: (err) => {
        if (err?.error) setFormErrors(err.error);
      },
    });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Create New User
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                name="username"
                fullWidth
                required
                value={form.username}
                onChange={handleChange}
                error={!!formErrors.username}
                helperText={formErrors.username?.[0]}
              />
            </Grid>

            {/* <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email?.[0]}
              />
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="first_name"
                fullWidth
                required
                value={form.first_name}
                onChange={handleChange}
                error={!!formErrors.first_name}
                helperText={formErrors.first_name?.[0]}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="last_name"
                fullWidth
                required
                value={form.last_name}
                onChange={handleChange}
                error={!!formErrors.last_name}
                helperText={formErrors.last_name?.[0]}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                required
                value={form.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password?.[0]}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Role"
                name="role"
                select
                fullWidth
                value={form.role}
                onChange={handleChange}
              >
                {roles.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {form.role === 'student' && (
              <Grid item xs={12}>
                <TextField
                  label="Roll Number"
                  name="roll_number"
                  fullWidth
                  required
                  value={form.roll_number}
                  onChange={handleChange}
                  error={!!formErrors.roll_number}
                  helperText={formErrors.roll_number || ''}
                />
              </Grid>
            )}
          </Grid>

          <Box mt={3}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending}
              sx={{ py: 1.2 }}
            >
              {isPending ? 'Creating...' : 'Create User'}
            </Button>
          </Box>

          {isSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ User created successfully!
            </Alert>
          )}

          {isError && !formErrors && (
            <Alert severity="error" sx={{ mt: 2 }}>
              ❌ Failed to create user. Please try again.
            </Alert>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default Users;
