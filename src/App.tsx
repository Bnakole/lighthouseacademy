import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Registration } from './pages/Registration';
import { VerifyEmail } from './pages/VerifyEmail';
import { StudentLogin } from './pages/StudentLogin';
import StudentPortal from './pages/StudentPortal';
import { AdminLogin } from './pages/AdminLogin';
import AdminPortal from './pages/AdminPortal';
import SecretaryPortal from './pages/SecretaryPortal';
import SCOPortal from './pages/SCOPortal';
import LeaderPortal from './pages/LeaderPortal';
import AdminBackend from './components/AdminBackend';
import AdminPromptEditor from './components/AdminPromptEditor';
import { Sessions } from './pages/Sessions';
import { SessionDetail } from './pages/SessionDetail';
import { AboutUs } from './pages/AboutUs';

export function App() {
  return (
    <HashRouter>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-portal" element={<AdminPortal />} />
            <Route path="/secretary-portal" element={<SecretaryPortal />} />
            <Route path="/sco-portal" element={<SCOPortal />} />
            <Route path="/leader-portal" element={<LeaderPortal />} />
            <Route path="/admin-backend" element={<AdminBackend />} />
            <Route path="/admin-prompt" element={<AdminPromptEditor />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:sessionId" element={<SessionDetail />} />
            <Route path="/about-us" element={<AboutUs />} />
          </Routes>
        </div>
      </AppProvider>
    </HashRouter>
  );
}
