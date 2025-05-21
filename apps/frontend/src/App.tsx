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
import Analysere from "./pages/Analysere";
import Settings from "./pages/Settings";
import RootLayout from "./components/RootLayout";
import Intro from "./pages/Intro"; // <-- Add this import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Intro />} /> {/* Default intro/info page */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="Analysere" element={<Analysere />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="Settings" element={<Settings />} />
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
