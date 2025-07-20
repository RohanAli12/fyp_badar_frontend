// src/api/api.js

export const API_ENDPOINTS = {
  // 🔐 Authentication
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  STUDENT_SIGNUP: '/auth/student-signup/',
  USER_PROFILE: '/auth/profile/',

  // 👑 Admin APIs
  ADMIN_CREATE_USER: '/admin/users/create/',
  ADMIN_GET_USERS: '/admin/users/',
  ADMIN_USER_DETAIL: (id) => `/admin/users/${id}/`,
ADMIN_RECORD_FACE: '/admin/faces/record/',
  ADMIN_UPLOAD_VIDEO: '/admin/videos/upload/',
  ADMIN_DETECTIONS: '/admin/detections/',

  // 🙋 General User APIs
  GENERAL_UPLOAD_VIDEO: '/general/videos/upload/',
  GENERAL_GET_DETECTIONS: '/general/detections/',

  // 🎓 Student APIs
  STUDENT_GET_DETECTIONS: '/student/detections/',
  // STUDENT_UPLOAD_FACE: '/admin/faces/record/', // ✅ same endpoint as Admin

  // 🧪 Testing
  TEST_MEDIA_FILES: '/test/media-files/',

  // 🌍 Public
  PUBLIC_FACES: '/public/faces/',
};
