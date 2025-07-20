import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

import API from './axios';
import { API_ENDPOINTS } from './api';
import { setToken, removeToken } from '../auth/useToken';


// ================== 🔐 AUTH ==================

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (credentials) => {
      const response = await API.post('/auth/login/', {
        username: credentials.username.trim(),
        password: credentials.password,
      });

      const { access, refresh, user } = response.data;

      // Store tokens & user
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    },

    onError: (error) => {
      const errorData = error.response?.data;
      const message =
        errorData?.non_field_errors?.[0] ||
        errorData?.detail ||
        'Login failed. Please check your credentials.';

      throw new Error(message);
    },
  });

// Logout
export const useLogoutMutation = () =>
  useMutation({
    mutationFn: async () => {
      await API.post(API_ENDPOINTS.LOGOUT);
      removeToken(); // Clear token
    },
  });

// Student Signup

export const useStudentSignupMutation = () =>
  useMutation({
    mutationFn: async (studentData) => {
      // Optional: frontend-level password validation
      if (studentData.password && studentData.password.length < 8) {
        throw {
          error: {
            password: ['Password must be at least 8 characters long'],
          },
        };
      }

      try {
        const response = await API.post(API_ENDPOINTS.STUDENT_SIGNUP, studentData, {
          headers: { 'Content-Type': 'application/json' },
        });

        const { access, refresh } = response.data;

        if (access && refresh) {
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
        }

        return response.data;
      } catch (error) {
        if (error.response?.status === 400) {
          throw { error: error.response.data };
        }

        throw {
          error: {
            non_field_errors: ['An unexpected error occurred. Please try again.'],
          },
        };
      }
    },
  });


// ================== 👑 ADMIN ==================

// Create User
export const useAdminCreateUserMutation = () =>
  useMutation({
    mutationFn: async (userData) => {
      try {
        const response = await API.post(API_ENDPOINTS.ADMIN_CREATE_USER, userData);
        return response.data;
      } catch (error) {
        if (error.response?.status === 400) {
          throw { error: error.response.data };
        }

        throw {
          error: {
            non_field_errors: ['Failed to create user. Please try again.'],
          },
        };
      }
    },
  });

 

// Upload Video
export const useAdminVideoUpload = () =>
  useMutation({
    mutationFn: async (formData) => {
      const res = await API.post(API_ENDPOINTS.ADMIN_UPLOAD_VIDEO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });

  export const useAdminGetUsers = (roleFilter = '') => {
  return useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const roleParam = roleFilter && roleFilter !== 'all' ? `?role=${roleFilter}` : '';
      const res = await API.get(`${API_ENDPOINTS.ADMIN_GET_USERS}${roleParam}`);
      return res.data.results || res.data; // handles paginated or flat response
    },
  });
};
// Hook with optional role
export const useAdminUsers = (roleFilter = '') =>
  useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const roleParam = roleFilter && roleFilter !== 'all' ? `?role=${roleFilter}` : '';
      const res = await API.get(`${API_ENDPOINTS.ADMIN_GET_USERS}${roleParam}`);

      return res.data.results || res.data;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });



// Get Detections
export const useAdminDetections = () =>
  useQuery({
    queryKey: ['admin-detections'],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.ADMIN_DETECTIONS);
      return res.data;
    },
  });


  // Get User Profile
export const useUserProfile = () =>
  useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.USER_PROFILE);
      return res.data;
    },
    staleTime: 0, // Immediately stale so it refetches
    cacheTime: 0, // Optional: removes from cache quickly
  });

// Get Public Face Files (for image gallery or preview)
export const usePublicFaces = () =>
  useQuery({
    queryKey: ['public-faces'],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.PUBLIC_FACES);
      return res.data;
    },
  });

// Admin: Get single user by ID
// export const useAdminUserDetail = (userId) =>
//   useQuery({
//     queryKey: ['admin-user-detail', userId],
//     queryFn: async () => {
//       const res = await API.get(API_ENDPOINTS.ADMIN_USER_DETAIL(userId));
//       return res.data;
//     },
//     enabled: !!userId,
//   });

//   export const useAdminGetUsers = (role) => {
//   const query = role === 'all' ? '' : `?role=${role}`;
//   return useQuery(['admin-users', role], async () => {
//     const res = await api.get(`/admin/users/${query}`);
//     return res.data;
//   });
// };

// PUT update user
export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => { // ✅ accept `data`, not `payload`
      const res = await API.put(API_ENDPOINTS.ADMIN_USER_DETAIL(id), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};





export const useAdminDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await API.delete(API_ENDPOINTS.ADMIN_USER_DETAIL(id));
    },
    onSuccess: () => {
      // Invalidate both versions
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users', 'all'] }); // roleFilter case
      queryClient.invalidateQueries({ queryKey: ['admin-users'], exact: false }); // safe catch-all
    },
  });
};



export const useAdminUserDetail = (userId) =>
  useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.ADMIN_USER_DETAIL(userId));
      return res.data;
    },
    enabled: !!userId, // ✅ this line prevents auto-fetch if userId is falsy
  });

// Upload Face Record
export const useAdminRecordFace = () =>
  useMutation({
    mutationFn: async (formData) => {
      const res = await API.post(API_ENDPOINTS.ADMIN_RECORD_FACE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });




// ================== 🙋 GENERAL USER ==================

// Upload Video
export const useGeneralVideoUpload = () =>
  useMutation({
    mutationFn: async (formData) => {
      const res = await API.post(API_ENDPOINTS.GENERAL_UPLOAD_VIDEO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });

// Get Detections
// src/api/mutation.js
export const useGeneralDetections = () =>
  useQuery({
    queryKey: ['general-detections'],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.GENERAL_GET_DETECTIONS);
      return res.data; // This is now a paginated object { count, next, previous, results }
    },
  });



// ================== 🎓 STUDENT ==================

// Upload / Update Face
export const useUploadFace = () =>
  useMutation({
    mutationFn: async (formData) => {
      const res = await API.post(API_ENDPOINTS.STUDENT_UPLOAD_FACE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });

// Get Detections
// src/api/mutation.js

export const useStudentDetections = () =>
  useQuery({
    queryKey: ['student-detections'],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.STUDENT_GET_DETECTIONS);
      return res.data; // Contains { message, total_detections, detections: [...] }
    },
  });

