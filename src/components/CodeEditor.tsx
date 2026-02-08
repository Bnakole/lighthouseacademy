import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

interface CodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

interface CodeEditorProps {
  onSave?: (path: string, content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onSave }) => {
  const [activeFile, setActiveFile] = useState<string>('App.tsx');
  const [files, setFiles] = useState<CodeFile[]>([
    {
      name: 'App.tsx',
      path: 'src/App.tsx',
      language: 'typescript',
      content: `// Main Application Entry Point
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import StudentLogin from './pages/StudentLogin';
import StudentPortal from './pages/StudentPortal';
import AdminLogin from './pages/AdminLogin';
import AdminPortal from './pages/AdminPortal';
import SecretaryPortal from './pages/SecretaryPortal';
import SCOPortal from './pages/SCOPortal';
import LeaderPortal from './pages/LeaderPortal';
import VerifyEmail from './pages/VerifyEmail';
import AboutUs from './pages/AboutUs';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:sessionId" element={<SessionDetail />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-portal" element={<AdminPortal />} />
            <Route path="/secretary-portal" element={<SecretaryPortal />} />
            <Route path="/sco-portal" element={<SCOPortal />} />
            <Route path="/leader-portal" element={<LeaderPortal />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;`
    },
    {
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Light House Academy - Online Training Programs</title>
    <meta name="description" content="Light House Academy - Your beacon of educational excellence. Join our online training programs and advance your career." />
    
    <!-- Cache Control -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://bit.ly/LightHouseAcademy" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Light House Academy" />
    <meta property="og:description" content="Your beacon of educational excellence. Join our online training programs." />
    <meta property="og:url" content="https://bit.ly/LightHouseAcademy" />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    {
      name: 'types.ts',
      path: 'src/types.ts',
      language: 'typescript',
      content: `// Type Definitions for Light House Academy

export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  statementOfPurpose: string;
  program: string;
  session: string;
  sessionName?: string;
  status: 'active' | 'inactive' | 'graduated';
  emailConfirmed: boolean;
  verificationCode: string;
  profilePicture?: string;
  certificate?: string;
  certificateUnlocked?: boolean;
  paymentReceipt?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  isLeader?: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationStatus: 'open' | 'closed' | 'upcoming' | 'ongoing';
  price: string;
  description?: string;
  facilitators?: Facilitator[];
}

export interface Facilitator {
  id: string;
  name: string;
  role: string;
  photo?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  targetProgram: string;
  targetSession: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'student' | 'admin' | 'secretary' | 'sco';
  recipientId: string;
  recipientType: 'student' | 'admin' | 'secretary' | 'sco';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface SiteSettings {
  siteName: string;
  logo?: string;
  aiApiKey?: string;
}`
    },
    {
      name: 'tailwind.config.js',
      path: 'tailwind.config.js',
      language: 'javascript',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}`
    },
    {
      name: 'firebase.ts',
      path: 'src/firebase.ts',
      language: 'typescript',
      content: `// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAGL-uMNU-46n_zbafbAcEfDWiA3zp6e_8",
  authDomain: "lighthouseministry-ed84b.firebaseapp.com",
  databaseURL: "https://lighthouseministry-ed84b-default-rtdb.firebaseio.com",
  projectId: "lighthouseministry-ed84b",
  storageBucket: "lighthouseministry-ed84b.firebasestorage.app",
  messagingSenderId: "72583394869",
  appId: "1:72583394869:web:9621232e747ee77ed9237c",
  measurementId: "G-JFQZWF3MRT"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.apiKey !== "" &&
         firebaseConfig.databaseURL !== "";
};

export default app;`
    }
  ]);

  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<string>('');

  const currentFile = files.find(f => f.name === activeFile);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    setFiles(prev => prev.map(f => 
      f.name === activeFile ? { ...f, content: value } : f
    ));
    setUnsavedChanges(prev => new Set(prev).add(activeFile));
  };

  const handleSave = () => {
    if (currentFile && onSave) {
      onSave(currentFile.path, currentFile.content);
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(activeFile);
        return newSet;
      });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return '📘';
    if (name.endsWith('.html')) return '🌐';
    if (name.endsWith('.css')) return '🎨';
    if (name.endsWith('.js')) return '📙';
    if (name.endsWith('.json')) return '📋';
    return '📄';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">📁 Light House Academy</span>
          <span className="text-gray-600">/</span>
          <span className="text-white text-sm">{activeFile}</span>
          {unsavedChanges.has(activeFile) && (
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-green-400 text-sm">{saveStatus}</span>
          )}
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            💾 Save
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-2">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-2">Files</p>
            {files.map(file => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${
                  activeFile === file.name
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <span>{getFileIcon(file.name)}</span>
                <span className="truncate">{file.name}</span>
                {unsavedChanges.has(file.name) && (
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full ml-auto"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          {currentFile && (
            <Editor
              height="100%"
              language={currentFile.language}
              value={currentFile.content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-blue-600 text-white px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span>TypeScript React</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Light House Academy Code Editor</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
