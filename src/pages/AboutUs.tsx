import { getStaffProfiles, getSiteSettings } from '../store';
import { Heart, Users, Mail, Phone, Briefcase } from 'lucide-react';

export function AboutUs() {
  const settings = getSiteSettings();
  const staff = getStaffProfiles();

  return (
    <div className="fade-in space-y-10 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="card-premium overflow-hidden">
        <div className="gradient-hero p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10">
            {settings.logo && (
              <img src={settings.logo} alt="Logo" className="w-24 h-24 rounded-full mx-auto mb-5 object-cover avatar-ring pulse-glow" />
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-display">
              About {settings.siteName}
            </h1>
            <p className="text-white/50 leading-relaxed max-w-2xl mx-auto">
              Light House Academy is a premier institution dedicated to nurturing talent in drama and theater arts. 
              Our online training programs bring together aspiring artists from across the globe, providing them with 
              the skills, knowledge, and community they need to shine on any stage.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="card-premium p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800">Our Staff</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {staff.map((s, i) => (
            <div key={i} className={`text-center p-6 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 slide-up stagger-${i + 1}`}>
              {s.picture ? (
                <img src={s.picture} alt={s.name} className="w-24 h-24 rounded-full mx-auto object-cover avatar-ring mb-4 shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto gradient-primary flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {s.name.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-gray-800 text-lg">{s.name}</h3>
              <span className="badge badge-gold mt-1 inline-block">{s.role}</span>
              {s.occupation && (
                <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Briefcase size={11} /> {s.occupation}
                </p>
              )}
              {s.email && (
                <p className="text-xs text-indigo-500 mt-1 flex items-center justify-center gap-1">
                  <Mail size={11} /> {s.email}
                </p>
              )}
              {s.phone && (
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <Phone size={11} /> {s.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Light House Family */}
      <div className="card-premium p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-amber-100/30 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Heart size={20} className="text-primary-dark" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">The Light House Family</h2>
          </div>
          <p className="text-gray-500 leading-relaxed">
            We are more than an academy — we are a family. Our community of students, leaders, and facilitators 
            come together to create, learn, and grow. From our Light House Theater productions to our online 
            training sessions, every member plays a vital role in our story.
          </p>
        </div>
      </div>
    </div>
  );
}
