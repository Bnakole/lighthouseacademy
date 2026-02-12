import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Registration } from './pages/Registration';
import { SessionsPage } from './pages/Sessions';
import { AboutUs } from './pages/AboutUs';
import { StudentLogin } from './pages/StudentLogin';
import { AdminLogin } from './pages/AdminLogin';
import { StudentPortal } from './pages/StudentPortal';
import { AdminPortal } from './pages/AdminPortal';
import { SecretaryPortal } from './pages/SecretaryPortal';
import { SCOPortal } from './pages/SCOPortal';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/admin-portal" element={<AdminPortal />} />
        <Route path="/secretary-portal" element={<SecretaryPortal />} />
        <Route path="/sco-portal" element={<SCOPortal />} />
      </Route>
    </Routes>
  );
}
