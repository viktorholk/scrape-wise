import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TestScrape from './pages/TestScrape';
import ProtectedRoute from './components/ProtectedRoute';
import { AppSidebar } from '@/components/app-sidebar';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="flex">
                <AppSidebar />
                <div className="flex-1">
                  <TestScrape />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect to login by default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
