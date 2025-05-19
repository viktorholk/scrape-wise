import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AppLayout } from '@/components/AppLayout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import ScraperSearch from './pages/ScraperSearch';
import Settings from './pages/Settings';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scraper-search" element={<ProtectedRoute><ScraperSearch /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/Settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect to login by default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
