import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, UserPlus, Calendar, Info, LogIn, Shield, Users, MessageCircle, Phone, Mail, MapPin, Search, ChevronDown, Clock, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { getSiteSettings } from '../store';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const settings = getSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Registration', href: '/registration', icon: UserPlus },
    { name: 'Sessions', href: '/sessions', icon: Calendar },
    { name: 'About Us', href: '/about', icon: Info },
    { name: 'Student Login', href: '/student-login', icon: LogIn },
    { name: 'Admin Login', href: '/admin-login', icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
      setIsSearchOpen(false);
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-indigo-950 to-purple-950 text-white py-2 border-b border-indigo-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-4 md:space-x-6">
              <a href="tel:+2348080498742" className="flex items-center space-x-1 hover:text-yellow-300 transition-colors">
                <Phone className="w-3 h-3" />
                <span>+234 808 049 8742</span>
              </a>
              <a href="mailto:info@lighthouseacademy.edu" className="hidden sm:flex items-center space-x-1 hover:text-yellow-300 transition-colors">
                <Mail className="w-3 h-3" />
                <span>info@lighthouseacademy.edu</span>
              </a>
              <div className="hidden md:flex items-center space-x-1 text-indigo-200">
                <Clock className="w-3 h-3" />
                <span>Mon - Fri: 9:00 AM - 5:00 PM</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a href="#" className="hover:text-yellow-300 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-yellow-300 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-yellow-300 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-yellow-300 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass-dark shadow-2xl backdrop-blur-xl' : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900'
      }`}>
        {/* Navigation */}
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse-glow"></div>
                <div className="relative bg-white rounded-full p-2 transform group-hover:scale-110 transition-transform duration-300">
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <Shield className="w-8 h-8 text-indigo-900" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {settings.siteName}
                </h1>
                <p className="text-xs text-indigo-200 hidden sm:block">Excellence in Drama Education</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-white/20 text-yellow-300 shadow-lg'
                      : 'text-white/90 hover:bg-white/10 hover:text-yellow-300'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Search & Apply */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
                {isSearchOpen && (
                  <form onSubmit={handleSearch} className="absolute right-0 top-12 bg-white rounded-lg shadow-2xl p-2 animate-scale-in">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="px-3 py-2 w-64 text-gray-800 focus:outline-none"
                      autoFocus
                    />
                  </form>
                )}
              </div>

              {/* Apply Now CTA */}
              <Link
                to="/registration"
                className="btn-gold px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Apply Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </nav>

        {/* Gold Accent Line */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-gradient-shift"></div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
        isMobileMenuOpen ? 'visible' : 'invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Slide-in Menu */}
        <div className={`absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 shadow-2xl transform transition-transform duration-500 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 pt-24">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-3 pr-10 rounded-lg bg-white/10 backdrop-blur text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-yellow-400"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              </div>
            </form>

            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-4 rounded-lg mb-2 text-white transition-all duration-300 animate-slide-in-right hover:bg-white/10 hover:translate-x-2 ${
                  isActive(item.href) ? 'bg-white/20 border-l-4 border-yellow-400' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* Mobile Apply Now */}
            <Link
              to="/registration"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-gold w-full text-center mt-6 py-3 font-semibold"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - Only on Homepage */}
      {isHomePage && (
        <section className="relative h-[600px] overflow-hidden">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-pink-900/90 z-10"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920')`,
              }}
            ></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Welcome to <span className="text-yellow-300">{settings.siteName}</span>
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-8">
                Nurturing Creative Excellence Through Drama Education
              </p>
              <p className="text-lg text-indigo-200 mb-10 leading-relaxed">
                Join our community of passionate artists and educators. Discover your potential, 
                develop your craft, and illuminate your path to success in the performing arts.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/registration" className="btn-gold px-8 py-4 text-lg font-semibold shadow-2xl">
                  Start Your Journey
                </Link>
                <Link to="/sessions" className="btn-ghost px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-indigo-900">
                  Explore Programs
                </Link>
                <Link to="/about" className="btn-accent px-8 py-4 text-lg font-semibold">
                  Virtual Tour
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-20"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </section>
      )}

      {/* Main Content */}
      <main className={!isHomePage ? 'pt-8' : ''}>
        <Outlet />
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white mt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <Shield className="w-8 h-8 text-yellow-300" />
                )}
                <h3 className="text-xl font-bold text-yellow-300">{settings.siteName}</h3>
              </div>
              <p className="text-indigo-200 text-sm mb-4">
                Excellence in drama education, nurturing talent and creativity for the future generation.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-300">Quick Links</h4>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-indigo-200 hover:text-yellow-300 transition-colors flex items-center space-x-2">
                      <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-300">Contact Us</h4>
              <div className="space-y-3 text-indigo-200">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-yellow-300" />
                  <span>+234 808 049 8742</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-yellow-300" />
                  <span>info@lighthouseacademy.edu</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1 text-yellow-300" />
                  <span>123 Academy Road, Lagos, Nigeria</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-300" />
                  <span>Mon - Fri: 9:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>

            {/* Legal & Policies */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-300">Legal & Policies</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-indigo-200 hover:text-yellow-300 transition-colors flex items-center space-x-2">
                    <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-indigo-200 hover:text-yellow-300 transition-colors flex items-center space-x-2">
                    <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                    <span>Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-indigo-200 hover:text-yellow-300 transition-colors flex items-center space-x-2">
                    <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                    <span>Cookie Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-indigo-200 hover:text-yellow-300 transition-colors flex items-center space-x-2">
                    <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                    <span>Disclaimer</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-indigo-800 mt-12 pt-8">
            <div className="max-w-2xl mx-auto text-center">
              <h4 className="text-lg font-semibold mb-4 text-yellow-300">Subscribe to Our Newsletter</h4>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-yellow-400"
                />
                <button className="btn-gold px-8 py-3 font-semibold">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-indigo-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <p className="text-indigo-200 text-sm">
                © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
                <Link to="/sitemap" className="text-indigo-200 hover:text-yellow-300 transition-colors">
                  Sitemap
                </Link>
                <Link to="/accessibility" className="text-indigo-200 hover:text-yellow-300 transition-colors">
                  Accessibility
                </Link>
                <Link to="/contact" className="text-indigo-200 hover:text-yellow-300 transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}