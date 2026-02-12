import { Link } from 'react-router-dom';
import { Users, BookOpen, Calendar, Award, ArrowRight, Sparkles, GraduationCap, Theater, UserPlus } from 'lucide-react';
import { getSiteSettings, getStudents, getSessions } from '../store';

export function Dashboard() {
  const settings = getSiteSettings();
  const students = getStudents();
  const sessions = getSessions();

  return (
    <div className="fade-in space-y-10">
      {/* Hero Section */}
      <div className="relative gradient-hero rounded-3xl p-8 md:p-14 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
          <div className="absolute inset-0 shimmer-bg" />
        </div>
        
        <div className="relative z-10 text-center">
          {settings.logo ? (
            <div className="inline-block mb-6 bounce-in">
              <img src={settings.logo} alt="Logo" className="w-24 h-24 rounded-full mx-auto object-cover avatar-ring pulse-glow" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-gold mb-6 bounce-in shadow-2xl">
              <Sparkles size={36} className="text-primary-dark" />
            </div>
          )}
          
          <h1 className="text-3xl md:text-6xl font-black mb-4 tracking-tight font-display">
            {settings.siteName}
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Empowering Creativity Through Drama & Theater Arts
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/registration" className="btn-gold flex items-center gap-2 text-base">
              <GraduationCap size={18} />
              Register Now
              <ArrowRight size={16} />
            </Link>
            <Link to="/sessions" className="btn-ghost flex items-center gap-2 text-base">
              <Calendar size={18} />
              View Sessions
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: <Users size={28} />, label: 'Students', value: students.length, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
          { icon: <Calendar size={28} />, label: 'Sessions', value: sessions.length, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
          { icon: <BookOpen size={28} />, label: 'Program', value: 'Online', color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
          { icon: <Award size={28} />, label: 'Certificates', value: 'Available', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className={`card-premium p-5 md:p-6 text-center slide-up stagger-${i + 1}`}>
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-3 shadow-lg`}>
              {stat.icon}
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-400 font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Program Section */}
      <div className="card-premium p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <Theater size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800">Our Program</h2>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎭</span>
              <h3 className="text-xl md:text-2xl font-bold text-white">Online Training</h3>
            </div>
            <p className="text-white/60 leading-relaxed max-w-2xl">
              Join our comprehensive online training program in drama and theater arts. Learn from experienced 
              facilitators in an interactive environment designed to unlock your creative potential.
            </p>
            <Link to="/sessions" className="inline-flex items-center gap-2 mt-4 text-amber-400 font-semibold hover:text-amber-300 transition">
              Explore Sessions <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { to: '/student-login', icon: <GraduationCap size={24} />, title: 'Student Portal', desc: 'Access your materials, certificates, and more', gradient: 'from-blue-500 to-indigo-600' },
          { to: '/registration', icon: <UserPlus size={24} />, title: 'Register', desc: 'Sign up for available training sessions', gradient: 'from-emerald-500 to-teal-600' },
          { to: '/about', icon: <Users size={24} />, title: 'About Us', desc: 'Learn about Light House Academy family', gradient: 'from-amber-500 to-orange-600' },
        ].map((link, i) => (
          <Link key={i} to={link.to} className={`card-premium-interactive p-6 md:p-7 fade-in stagger-${i + 1}`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} text-white mb-4 shadow-lg`}>
              {link.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              {link.title}
              <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 transition" />
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
