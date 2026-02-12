import { Link } from 'react-router-dom';
import { getSessions } from '../store';
import { Calendar, ArrowRight, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

export function SessionsPage() {
  const sessions = getSessions();

  const statusConfig: Record<string, { badge: string; icon: React.ReactNode; label: string }> = {
    open: { badge: 'badge-success', icon: <CheckCircle size={12} />, label: 'OPEN' },
    ongoing: { badge: 'badge-info', icon: <Loader size={12} />, label: 'ONGOING' },
    upcoming: { badge: 'badge-warning', icon: <Clock size={12} />, label: 'UPCOMING' },
    closed: { badge: 'badge-danger', icon: <XCircle size={12} />, label: 'CLOSED' }
  };

  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
          <Calendar size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Sessions</h1>
          <p className="text-sm text-gray-400">Browse and register for available training sessions</p>
        </div>
      </div>
      
      {sessions.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">No sessions available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session, i) => {
            const config = statusConfig[session.status] || statusConfig.upcoming;
            return (
              <div key={session.id} className={`card-premium overflow-hidden slide-up stagger-${Math.min(i + 1, 6)}`}>
                {/* Image */}
                {session.facilitatorImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <img src={session.facilitatorImage} alt={session.facilitatorName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      {session.facilitatorName && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold">
                            {session.facilitatorName.charAt(0)}
                          </div>
                          <span className="text-white text-sm font-semibold drop-shadow">{session.facilitatorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 gradient-primary relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 shimmer-bg" />
                    <span className="text-5xl relative z-10">🎭</span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`badge ${config.badge} flex items-center gap-1`}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-xl font-extrabold gradient-gold bg-clip-text text-transparent" 
                      style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: session.price === 'Free' ? '' : 'transparent', color: session.price === 'Free' ? '#059669' : '' }}>
                      {session.price || 'Free'}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-gray-800 mb-2">{session.name}</h2>
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed line-clamp-2">{session.description}</p>
                  
                  {session.facilitatorName && !session.facilitatorImage && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                      <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center text-white text-xs">
                        {session.facilitatorName.charAt(0)}
                      </div>
                      <span>Facilitator: <strong className="text-gray-700">{session.facilitatorName}</strong></span>
                    </div>
                  )}
                  
                  {(session.status === 'open' || session.status === 'ongoing') ? (
                    <Link to="/registration" 
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                      Register Now <ArrowRight size={16} />
                    </Link>
                  ) : session.status === 'upcoming' ? (
                    <div className="w-full text-center py-3 rounded-xl bg-amber-50 text-amber-700 font-semibold text-sm border border-amber-200 flex items-center justify-center gap-2">
                      <Clock size={16} /> Coming Soon
                    </div>
                  ) : (
                    <div className="w-full text-center py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm border border-red-200 flex items-center justify-center gap-2">
                      <XCircle size={16} /> Registration Closed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
