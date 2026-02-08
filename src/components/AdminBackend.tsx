import React, { useState, useEffect } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { database, isFirebaseConfigured } from '../firebase';
import { useApp } from '../context/AppContext';

const AdminBackend: React.FC = () => {
  const { students, sessions, messages, siteSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'export' | 'logs' | 'raw'>('overview');
  const [databaseData, setDatabaseData] = useState<any>(null);
  const [editingNode, setEditingNode] = useState<{ path: string; value: any } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [rawJson, setRawJson] = useState('');
  const [importJson, setImportJson] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['/', '/students', '/sessions']));
  const [searchTerm, setSearchTerm] = useState('');

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  // Load database data
  useEffect(() => {
    addLog('Admin Backend initialized');
    
    if (isFirebaseConfigured()) {
      addLog('Firebase connection active');
      const dbRef = ref(database, '/');
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        setDatabaseData(data);
        setRawJson(JSON.stringify(data, null, 2));
        addLog('Database synced from Firebase');
      }, (error) => {
        addLog(`Firebase error: ${error.message}`);
      });
      return () => unsubscribe();
    } else {
      addLog('Using localStorage (Firebase not configured)');
      const data = {
        students: JSON.parse(localStorage.getItem('lha_students') || '[]'),
        sessions: JSON.parse(localStorage.getItem('lha_sessions') || '[]'),
        messages: JSON.parse(localStorage.getItem('lha_messages') || '[]'),
        siteSettings: JSON.parse(localStorage.getItem('lha_siteSettings') || '{}'),
      };
      setDatabaseData(data);
      setRawJson(JSON.stringify(data, null, 2));
    }
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle node expansion
  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  // Export data
  const handleExport = (type: 'all' | 'students' | 'sessions' | 'messages') => {
    let data: any;
    let filename: string;
    
    switch (type) {
      case 'students':
        data = students;
        filename = 'lha_students.json';
        break;
      case 'sessions':
        data = sessions;
        filename = 'lha_sessions.json';
        break;
      case 'messages':
        data = messages;
        filename = 'lha_messages.json';
        break;
      default:
        data = { students, sessions, messages, siteSettings };
        filename = 'lha_full_backup.json';
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported ${type} data to ${filename}`);
    showNotification('success', `Exported ${type} data successfully!`);
  };

  // Import data
  const handleImport = () => {
    try {
      const data = JSON.parse(importJson);
      
      if (isFirebaseConfigured()) {
        if (data.students) set(ref(database, 'students'), data.students);
        if (data.sessions) set(ref(database, 'sessions'), data.sessions);
        if (data.messages) set(ref(database, 'messages'), data.messages);
        if (data.siteSettings) set(ref(database, 'siteSettings'), data.siteSettings);
        addLog('Data imported to Firebase');
      } else {
        if (data.students) localStorage.setItem('lha_students', JSON.stringify(data.students));
        if (data.sessions) localStorage.setItem('lha_sessions', JSON.stringify(data.sessions));
        if (data.messages) localStorage.setItem('lha_messages', JSON.stringify(data.messages));
        if (data.siteSettings) localStorage.setItem('lha_siteSettings', JSON.stringify(data.siteSettings));
        addLog('Data imported to localStorage');
      }
      
      showNotification('success', 'Data imported successfully! Refresh to see changes.');
      setShowImportModal(false);
      setImportJson('');
    } catch (error) {
      addLog(`Import error: ${error}`);
      showNotification('error', 'Invalid JSON format');
    }
  };

  // Edit node
  const handleEditNode = (path: string, value: any) => {
    setEditingNode({ path, value });
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
  };

  // Save node
  const handleSaveNode = () => {
    if (!editingNode) return;
    
    try {
      let newValue: any = editValue;
      try {
        newValue = JSON.parse(editValue);
      } catch {
        // Keep as string
      }
      
      if (isFirebaseConfigured()) {
        set(ref(database, editingNode.path), newValue);
        addLog(`Updated ${editingNode.path}`);
        showNotification('success', 'Data updated!');
      } else {
        showNotification('error', 'Direct editing requires Firebase');
      }
      
      setEditingNode(null);
    } catch (error) {
      showNotification('error', 'Failed to save');
    }
  };

  // Delete node
  const handleDeleteNode = (path: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    
    if (isFirebaseConfigured()) {
      remove(ref(database, path));
      addLog(`Deleted ${path}`);
      showNotification('success', 'Deleted successfully!');
    } else {
      showNotification('error', 'Deletion requires Firebase');
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (!confirm('⚠️ DELETE ALL DATA? This cannot be undone!')) return;
    if (!confirm('Are you absolutely sure? Type "DELETE" in the next prompt.')) return;
    
    const confirmation = prompt('Type DELETE to confirm:');
    if (confirmation !== 'DELETE') {
      showNotification('error', 'Deletion cancelled');
      return;
    }
    
    if (isFirebaseConfigured()) {
      set(ref(database, '/'), null);
      addLog('All data cleared from Firebase');
    } else {
      localStorage.clear();
      addLog('All data cleared from localStorage');
    }
    showNotification('success', 'All data cleared!');
  };

  // Render tree node
  const renderTreeNode = (key: string, value: any, path: string, level: number = 0) => {
    const fullPath = path ? `${path}/${key}` : `/${key}`;
    const isExpanded = expandedNodes.has(fullPath);
    const isObject = typeof value === 'object' && value !== null;
    const isArray = Array.isArray(value);
    
    // Filter by search
    if (searchTerm && !JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase()) && 
        !key.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return (
      <div key={fullPath} className="font-mono text-sm">
        <div 
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-700 rounded cursor-pointer ${level === 0 ? 'bg-gray-700' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {isObject && (
            <button 
              onClick={() => toggleNode(fullPath)}
              className="text-gray-400 hover:text-white w-4"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!isObject && <span className="w-4"></span>}
          
          <span 
            className={`${isObject ? 'text-yellow-400' : 'text-blue-400'}`}
            onClick={() => isObject && toggleNode(fullPath)}
          >
            {key}
            {isArray && <span className="text-gray-500">[{value.length}]</span>}
            {isObject && !isArray && <span className="text-gray-500">{`{${Object.keys(value).length}}`}</span>}
          </span>
          
          {!isObject && (
            <span className="text-green-400 truncate max-w-xs">
              : {typeof value === 'string' ? `"${value.substring(0, 30)}${value.length > 30 ? '...' : ''}"` : String(value)}
            </span>
          )}
          
          <div className="ml-auto flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleEditNode(fullPath, value); }}
              className="text-xs px-2 py-0.5 bg-blue-600 hover:bg-blue-500 rounded text-white"
            >
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteNode(fullPath, key); }}
              className="text-xs px-2 py-0.5 bg-red-600 hover:bg-red-500 rounded text-white"
            >
              Delete
            </button>
          </div>
        </div>
        
        {isObject && isExpanded && (
          <div>
            {Object.entries(value).map(([k, v]) => renderTreeNode(k, v, fullPath, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">🔧 Backend Management</h1>
            <span className={`px-2 py-1 rounded text-xs ${isFirebaseConfigured() ? 'bg-green-600' : 'bg-yellow-600'}`}>
              {isFirebaseConfigured() ? '🔥 Firebase Connected' : '💾 LocalStorage Mode'}
            </span>
          </div>
          <a href="/#/admin-portal" className="text-blue-400 hover:text-blue-300">
            ← Back to Admin Portal
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'overview', label: '📊 Overview', icon: '' },
            { id: 'database', label: '🗄️ Database', icon: '' },
            { id: 'export', label: '📤 Export/Import', icon: '' },
            { id: 'raw', label: '📝 Raw JSON', icon: '' },
            { id: 'logs', label: '📋 Logs', icon: '' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-t ${activeTab === tab.id ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{students.length}</div>
                <div className="text-gray-400">Total Students</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{sessions.length}</div>
                <div className="text-gray-400">Sessions</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">{messages.length}</div>
                <div className="text-gray-400">Messages</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">
                  {students.filter(s => s.paymentStatus === 'approved').length}
                </div>
                <div className="text-gray-400">Verified Payments</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">📈 Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Students</span>
                    <span className="text-green-400">{students.filter(s => s.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Leaders</span>
                    <span className="text-yellow-400">{students.filter(s => s.isLeader).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending Payments</span>
                    <span className="text-orange-400">{students.filter(s => s.paymentStatus === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Certificates Issued</span>
                    <span className="text-blue-400">{students.filter(s => s.certificate).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verified Emails</span>
                    <span className="text-green-400">{students.filter(s => s.emailConfirmed).length}</span>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">🖥️ System Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage Mode</span>
                    <span className={isFirebaseConfigured() ? 'text-green-400' : 'text-yellow-400'}>
                      {isFirebaseConfigured() ? 'Firebase Realtime DB' : 'LocalStorage'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Site Name</span>
                    <span className="text-white">{siteSettings?.siteName || 'Light House Academy'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Configured</span>
                    <span className={siteSettings?.aiApiKey ? 'text-green-400' : 'text-red-400'}>
                      {siteSettings?.aiApiKey ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Activity</span>
                    <span className="text-white">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/30 border border-red-600 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-red-400 mb-4">⚠️ Danger Zone</h3>
              <p className="text-gray-400 mb-4">These actions are irreversible. Proceed with extreme caution.</p>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Database Explorer</h2>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded focus:border-blue-500 outline-none"
              />
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-2 bg-gray-700 text-sm text-gray-400">
                📁 / (root)
              </div>
              <div className="p-2 max-h-[600px] overflow-auto">
                {databaseData ? (
                  Object.entries(databaseData).map(([key, value]) => renderTreeNode(key, value, '', 0))
                ) : (
                  <div className="text-gray-400 text-center py-8">Loading database...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Export/Import Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Export & Import Data</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Section */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">📤 Export Data</h3>
                <p className="text-gray-400 mb-4">Download your data as JSON files for backup or migration.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleExport('all')}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold flex items-center justify-center gap-2"
                  >
                    📦 Export All Data
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport('students')}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      👥 Students
                    </button>
                    <button
                      onClick={() => handleExport('sessions')}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      📅 Sessions
                    </button>
                    <button
                      onClick={() => handleExport('messages')}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      💬 Messages
                    </button>
                  </div>
                </div>
              </div>

              {/* Import Section */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">📥 Import Data</h3>
                <p className="text-gray-400 mb-4">Import data from a JSON backup file.</p>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded font-bold flex items-center justify-center gap-2"
                >
                  📁 Import from JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Raw JSON Tab */}
        {activeTab === 'raw' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Raw Database JSON</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawJson);
                  showNotification('success', 'Copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
              >
                📋 Copy All
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <pre className="text-green-400 text-sm overflow-auto max-h-[600px] whitespace-pre-wrap">
                {rawJson || 'Loading...'}
              </pre>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Activity Logs</h2>
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 max-h-[600px] overflow-auto">
              {logs.length > 0 ? (
                <div className="space-y-1 font-mono text-sm">
                  {logs.map((log, i) => (
                    <div key={i} className="text-gray-300 border-b border-gray-700 py-1">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">No logs yet</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold">Edit: {editingNode.path}</h3>
            </div>
            <div className="p-4">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-64 bg-gray-900 border border-gray-600 rounded p-3 font-mono text-sm text-green-400 focus:border-blue-500 outline-none"
                placeholder="Enter value (JSON or string)"
              />
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold">Import Data</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-400 mb-4">Paste your JSON data below. This will merge with existing data.</p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full h-64 bg-gray-900 border border-gray-600 rounded p-3 font-mono text-sm text-green-400 focus:border-blue-500 outline-none"
                placeholder='{"students": [...], "sessions": [...], ...}'
              />
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowImportModal(false); setImportJson(''); }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackend;
