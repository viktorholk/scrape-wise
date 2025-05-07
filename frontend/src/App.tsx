import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AppLayout } from '@/components/AppLayout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';

function App() {
  return (
    <Router>
      <Routes>


        <Route path="/" element={<AppLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />

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
