import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AppLayout } from "@/components/AppLayout";
import Jobs from "./pages/Jobs";
import Analyze from "./pages/Analyze";
import Settings from "./pages/Settings";
import RootLayout from "./components/RootLayout";
import Intro from "./pages/Intro";
import ScheduledJobs from "./pages/ScheduledJobs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Intro />} /> 
            <Route path="scheduled-jobs" element={<ScheduledJobs/>} />
            <Route path="analyze" element={<Analyze/>} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
