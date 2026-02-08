import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Navbar() {
  const location = useLocation();
  const { auth, logoutStudent, logoutAdmin, siteSettings } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightHouseDropdownOpen, setIsLightHouseDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setIsMenuOpen(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLightHouseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg relative">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            {siteSettings.logo ? (
              <img src={siteSettings.logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            )}
            <span className="text-white font-bold text-sm sm:text-lg md:text-xl tracking-wide truncate max-w-[140px] sm:max-w-none">{siteSettings.siteName.toUpperCase()}</span>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              /* X Icon */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger Icon */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop & Tablet Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Light House Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLightHouseDropdownOpen(!isLightHouseDropdownOpen)}
                className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium text-purple-200 hover:bg-purple-500/20 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Light House</span>
                <svg className={`w-4 h-4 transition-transform ${isLightHouseDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLightHouseDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                  <div className="py-2">
                    <a
                      href="https://bit.ly/LightHouseAcademy"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsLightHouseDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold group-hover:text-blue-600">Light House Academy</p>
                        <p className="text-xs text-gray-500">Online Training Programs</p>
                      </div>
                    </a>
                    
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setIsLightHouseDropdownOpen(false); }}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-pink-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold group-hover:text-pink-600">Light House Music</p>
                        <p className="text-xs text-gray-500">Gospel Music & Worship</p>
                      </div>
                    </a>
                    
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setIsLightHouseDropdownOpen(false); }}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold group-hover:text-orange-600">Light House Radio</p>
                        <p className="text-xs text-gray-500">Live Broadcasting</p>
                      </div>
                    </a>
                    
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setIsLightHouseDropdownOpen(false); }}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold group-hover:text-purple-600">Light House Theater</p>
                        <p className="text-xs text-gray-500">Drama & Performances</p>
                      </div>
                    </a>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-2 border-t">
                    <p className="text-xs text-gray-500 text-center">Part of the Light House Family</p>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/register"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/register') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Registration
            </Link>
            <Link
              to="/sessions"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/sessions') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Sessions
            </Link>
            <Link
              to="/about-us"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/about-us') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              About Us
            </Link>

            {auth.isStudentLoggedIn ? (
              <>
                <Link
                  to="/student-portal"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/student-portal') ? 'bg-green-500 text-white' : 'text-green-300 hover:bg-green-500/20'
                  }`}
                >
                  Student Portal
                </Link>
                <button
                  onClick={logoutStudent}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/student-login"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/student-login') ? 'bg-green-500 text-white' : 'text-green-300 hover:bg-green-500/20'
                }`}
              >
                Student Login
              </Link>
            )}

            {auth.isAdminLoggedIn ? (
              <>
                <Link
                  to="/admin-portal"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin-portal') ? 'bg-yellow-500 text-black' : 'text-yellow-300 hover:bg-yellow-500/20'
                  }`}
                >
                  Admin Portal
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 transition-all"
                >
                  Admin Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin-login"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin-login') ? 'bg-yellow-500 text-black' : 'text-yellow-300 hover:bg-yellow-500/20'
                }`}
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-12 sm:top-14 left-0 right-0 bg-gradient-to-b from-blue-800 to-indigo-900 shadow-2xl z-50 border-t border-white/10 max-h-[85vh] overflow-y-auto">
          <div className="px-2 py-2 space-y-0.5">
            {/* Light House Functions Section */}
            <div className="bg-white/10 rounded-lg p-2 mb-2">
              <p className="text-[10px] text-purple-200 font-semibold uppercase tracking-wider mb-1 px-1">Light House Family</p>
              
              <a
                href="https://bit.ly/LightHouseAcademy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-xs">Light House Academy</p>
                  <p className="text-[10px] text-blue-200">Online Training</p>
                </div>
              </a>
              
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); closeMenu(); }}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-xs">Light House Music</p>
                  <p className="text-[10px] text-pink-200">Gospel & Worship</p>
                </div>
              </a>
              
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); closeMenu(); }}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-xs">Light House Radio</p>
                  <p className="text-[10px] text-orange-200">Live Broadcasting</p>
                </div>
              </a>
              
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); closeMenu(); }}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-xs">Light House Theater</p>
                  <p className="text-[10px] text-purple-200">Drama & Performances</p>
                </div>
              </a>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-1"></div>

            {/* Main Navigation Links */}
            <Link
              to="/"
              onClick={closeMenu}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/register"
              onClick={closeMenu}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/register') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Registration</span>
            </Link>

            <Link
              to="/sessions"
              onClick={closeMenu}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/sessions') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Sessions</span>
            </Link>

            <Link
              to="/about-us"
              onClick={closeMenu}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/about-us') ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>About Us</span>
            </Link>

            {/* Divider */}
            <div className="border-t border-white/10 my-1"></div>

            {/* Student Section */}
            {auth.isStudentLoggedIn ? (
              <>
                <Link
                  to="/student-portal"
                  onClick={closeMenu}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/student-portal') ? 'bg-green-500/30 text-green-300' : 'text-green-300 hover:bg-green-500/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Student Portal</span>
                </Link>
                <button
                  onClick={() => {
                    logoutStudent();
                    closeMenu();
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/student-login"
                onClick={closeMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/student-login') ? 'bg-green-500/30 text-green-300' : 'text-green-300 hover:bg-green-500/20'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Student Login</span>
              </Link>
            )}

            {/* Admin Section */}
            {auth.isAdminLoggedIn ? (
              <>
                <Link
                  to="/admin-portal"
                  onClick={closeMenu}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin-portal') ? 'bg-yellow-500/30 text-yellow-300' : 'text-yellow-300 hover:bg-yellow-500/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin Portal</span>
                </Link>
                <button
                  onClick={() => {
                    logoutAdmin();
                    closeMenu();
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Admin Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/admin-login"
                onClick={closeMenu}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin-login') ? 'bg-yellow-500/30 text-yellow-300' : 'text-yellow-300 hover:bg-yellow-500/20'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="px-2 py-2 bg-black/20 border-t border-white/10">
            <p className="text-center text-[10px] text-blue-200">© 2026 Light House Academy</p>
          </div>
        </div>
      )}
    </nav>
  );
}
