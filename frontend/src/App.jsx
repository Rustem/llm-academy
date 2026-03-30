import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseRoute from "./components/CourseRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import ExercisePage from "./pages/ExercisePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ClassroomsPage from "./pages/ClassroomsPage";
import ClassroomDetailPage from "./pages/ClassroomDetailPage";
import AdminPage from "./pages/AdminPage";
import PrivacyPage from "./pages/PrivacyPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/classrooms" element={<ProtectedRoute><ClassroomsPage /></ProtectedRoute>} />
          <Route path="/classroom/:classroomId" element={<ProtectedRoute><ClassroomDetailPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* Course routes: general is public, others require auth */}
          <Route path="/course/:courseId" element={<CourseRoute><DashboardPage /></CourseRoute>} />
          <Route path="/course/:courseId/exercise/:id" element={<CourseRoute><ExercisePage /></CourseRoute>} />

          {/* Backward compat */}
          <Route path="/dashboard" element={<Navigate to="/courses" replace />} />
          <Route path="/exercise/:id" element={<Navigate to="/course/general" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
