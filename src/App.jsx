import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./auth/useAuth";
import ProtectedRoute from "./auth/ProtectedRoute";
import LandingPage from "./pages/auth/LandingPage";
// Layouts
import AdminLayout from "./layouts/AdminLayout";
import GeneralLayout from "./layouts/GeneralLayout";
import StudentLayout from "./layouts/StudentLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import StudentSignupPage from "./pages/auth/StudentSignupPage"; // ✅ FIXED: Import signup page

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import UploadFace from "./pages/admin/UploadFace"; // ✅ Include missing
import UploadVideo from "./pages/admin/UploadVideo"; // ✅ Include missing
import Detections from "./pages/admin/Detections";
import AdminProfile from "./pages/admin/AdminProfile";
import UserDetail from "./pages/admin/UserDetail";
import AdminUserList from "./pages/admin/AdminUserList";
import LiveStream from "./pages/admin/LiveStream";


// General User Pages
import GeneralDashboard from "./pages/general/Dashboard";
import GeneralUpload from "./pages/general/UploadVideo";
import GeneralDetections from "./pages/general/Detections";
import GeneralProfile from "./pages/general/GeneralProfile";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentUpload from "./pages/student/MyFace";
import StudentDetections from "./pages/student/Detections";
import StudentProfile from "./pages/student/StudentProfile";

function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<StudentSignupPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<AdminUserList />} /> // 👉 List all users
        <Route path="users/create" element={<Users />} /> // 👉 Create user form
        <Route path="users/:id" element={<UserDetail />} /> // 👉 View/edit user
        <Route path="upload-face" element={<UploadFace />} />
        <Route path="upload-video" element={<UploadVideo />} />
        <Route path="detections" element={<Detections />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="live-stream" element={<LiveStream />} />
      </Route>

      {/* General User Protected Routes */}
      <Route
        path="/general/*"
        element={
          <ProtectedRoute role="general">
            <GeneralLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GeneralDashboard />} />
  <Route path="upload-video" element={<GeneralUpload />} />
  <Route path="detections" element={<GeneralDetections />} />
  <Route path="profile" element={<GeneralProfile />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="upload" element={<StudentUpload />} />
        <Route path="detections" element={<StudentDetections />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
