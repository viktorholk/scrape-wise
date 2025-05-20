import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import ScraperSearch from "./pages/ScraperSearch";
import Settings from "./pages/Settings";
import RootLayout from "./components/RootLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="/" element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scraper-search" element={<ScraperSearch />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/Settings" element={<Settings />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect to login by default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
