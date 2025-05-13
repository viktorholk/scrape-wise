import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AppLayout } from '@/components/AppLayout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import ScraperSearch from './pages/ScraperSearch';
import Settings from './pages/Settings';

function App() {

  const ws = new WebSocket('ws://localhost:3001?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc0NzA1NzA5MywiZXhwIjoxNzQ3MTQzNDkzfQ.NFzmoU0cidM5LC_TwbRtWSKZgCAhZjvVe4ysLv6tD4c');

  ws.onopen = () => {
    console.log('Connected to server');
  };

  ws.onclose = () => {
    console.log('Disconnected from server');
  };

  ws.onerror = (event) => {
    console.error(event);
  };

  ws.onmessage = (event) => {
    console.log(event.data);
  };


  return (
    <Router>
      <Routes>

        <Route path="/" element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scraper-search" element={<ScraperSearch />} /> {/* Assuming ScraperSearch is part of the dashboard */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/Settings" element={<Settings />} /> {/* Assuming ScraperSearch is part of the dashboard */}
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
