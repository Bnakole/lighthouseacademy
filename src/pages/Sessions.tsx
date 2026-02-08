import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Sessions() {
  const { sessions, students } = useApp();

  const getStudentCount = (sessionId: string) => {
    return students.filter(s => s.session === sessionId).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'from-green-500 to-emerald-600';
      case 'upcoming':
        return 'from-blue-500 to-indigo-600';
      case 'completed':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Academic Sessions</h1>
          <p className="text-gray-600">View and explore our academic sessions</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <Link
              key={session.id}
              to={`/sessions/${session.id}`}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`h-24 bg-gradient-to-r ${getStatusBg(session.status)} flex items-center justify-center`}>
                <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${session.price === 'free' ? 'bg-green-500 text-white animate-pulse' : 'bg-blue-500 text-white'}`}>
                      {session.price === 'free' ? 'FREE' : `₦${session.price}`}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {getStudentCount(session.id)} students
                  </span>
                </div>
                
                {/* Registration Status Badge */}
                <div className={`mb-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                  session.registrationStatus === 'open' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : session.registrationStatus === 'ongoing'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : session.registrationStatus === 'upcoming'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {session.registrationStatus === 'open' && '🟢 Registration Open'}
                  {session.registrationStatus === 'ongoing' && '🔵 Registration Ongoing'}
                  {session.registrationStatus === 'upcoming' && '🟡 Registration Not Started'}
                  {session.registrationStatus === 'closed' && '🔴 Registration Closed'}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {session.name}
                </h3>
                {session.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                )}
                {session.facilitators && session.facilitators.length > 0 && (
                  <div className="flex items-center mb-3">
                    <div className="flex -space-x-2">
                      {session.facilitators.slice(0, 3).map(f => (
                        f.photo ? (
                          <img key={f.id} src={f.photo} alt={f.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        ) : (
                          <div key={f.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {f.name[0]}
                          </div>
                        )
                      ))}
                      {session.facilitators.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium">
                          +{session.facilitators.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">{session.facilitators.length} facilitator(s)</span>
                  </div>
                )}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Start: {session.startDate}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    End: {session.endDate}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-blue-600 font-medium text-sm group-hover:underline">
                    View Details →
                  </span>
                  {(session.registrationStatus === 'open' || session.registrationStatus === 'ongoing') && (
                    <Link
                      to="/register"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Register Now
                    </Link>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
