import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VirtualClassroom from './pages/VirtualClassroom';
import Assignments from './pages/Assignments';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetail from './pages/AssignmentDetail';
import Submissions from './pages/Submissions';
import LearningMaterials from './pages/LearningMaterials';
import StudentMaterials from './pages/StudentMaterials';
import ForgotPassword from './pages/ForgotPassword';
import Queries from './pages/Queries';
import QueryDetail from './pages/QueryDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute requiredRole="TEACHER">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/virtual-classroom/:classGrade"
            element={
              <ProtectedRoute>
                <VirtualClassroom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/create"
            element={
              <ProtectedRoute requiredRole="TEACHER">
                <CreateAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/:id"
            element={
              <ProtectedRoute>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute requiredRole="TEACHER">
                <Submissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-materials"
            element={
              <ProtectedRoute requiredRole="TEACHER">
                <LearningMaterials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/materials"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentMaterials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queries"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <Queries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queries/:queryId"
            element={
              <ProtectedRoute>
                <QueryDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
