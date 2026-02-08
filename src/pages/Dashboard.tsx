import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AnnouncementBanner, CountdownTimer, SocialLinks } from '../components/AdvancedFeatures';

export function Dashboard() {
  const { students, sessions, siteSettings } = useApp();

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    totalSessions: sessions.length,
    ongoingSessions: sessions.filter(s => s.status === 'ongoing').length,
  };

  // Get enabled features
  const enabledFeatures = siteSettings.features?.filter(f => f.enabled) || [];
  const announcementFeature = enabledFeatures.find(f => f.type === 'announcementBanner');
  const countdownFeature = enabledFeatures.find(f => f.type === 'countdownTimer');
  const socialLinksFeature = enabledFeatures.find(f => f.type === 'socialLinks');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic Announcement Banner */}
      {(siteSettings.announcement || announcementFeature) && (
        <AnnouncementBanner 
          text={siteSettings.announcement || announcementFeature?.config?.text || 'Welcome to Light House Academy!'} 
          type={(siteSettings.announcementType || announcementFeature?.config?.type || 'info') as 'info' | 'warning' | 'success' | 'error'} 
        />
      )}

      {/* Dynamic Countdown Timer */}
      {countdownFeature && (
        <CountdownTimer 
          targetDate={countdownFeature.config?.targetDate || '2026-01-06'} 
          label={countdownFeature.config?.label || 'Training Starts In:'} 
        />
      )}

      {/* Dynamic Social Links */}
      {(siteSettings.socialLinks || socialLinksFeature) && (
        <SocialLinks links={siteSettings.socialLinks || socialLinksFeature?.config?.links || {}} />
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-14 h-14 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">LIGHT HOUSE ACADEMY</h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Illuminating Minds, Shaping Futures. Your journey to excellence starts here.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-lg hover:bg-yellow-300 transition-all shadow-lg"
              >
                Register Now
              </Link>
              <Link
                to="/sessions"
                className="px-8 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all border border-white/30"
              >
                View Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-gray-500 mt-1">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-600">{stats.activeStudents}</div>
            <div className="text-gray-500 mt-1">Active Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-600">{stats.totalSessions}</div>
            <div className="text-gray-500 mt-1">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-orange-600">{stats.ongoingSessions}</div>
            <div className="text-gray-500 mt-1">Ongoing Sessions</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Light House Academy?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Education</h3>
            <p className="text-gray-600">World-class curriculum designed to prepare students for future challenges.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Faculty</h3>
            <p className="text-gray-600">Learn from experienced professionals dedicated to your success.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Modern Facilities</h3>
            <p className="text-gray-600">State-of-the-art facilities to enhance your learning experience.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">Join Light House Academy today and unlock your potential.</p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4">© 2026 Light House Academy. All rights reserved.</p>
          <p>Illuminating Minds, Shaping Futures.</p>
        </div>
      </footer>
    </div>
  );
}
