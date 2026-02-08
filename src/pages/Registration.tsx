import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Registration() {
  const { addStudent, sessions, students } = useApp();
  const navigate = useNavigate();
  const [registrationResult, setRegistrationResult] = useState<{ registrationNumber: string } | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showSessionErrorModal, setShowSessionErrorModal] = useState<{ type: 'closed' | 'upcoming'; sessionName: string } | null>(null);
  const [passport, setPassport] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dramaGroup: '',
    position: '',
    country: '',
    state: '',
    address: '',
    session: '',
    program: 'Online Training',
  });

  // Countries and their states
  const countriesWithStates: Record<string, string[]> = {
    'Nigeria': [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
      'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
      'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
      'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
      'Yobe', 'Zamfara'
    ],
    'United States': [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ],
    'United Kingdom': [
      'England', 'Scotland', 'Wales', 'Northern Ireland', 'London', 'Birmingham', 'Manchester',
      'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Newcastle', 'Glasgow', 'Edinburgh'
    ],
    'Canada': [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ],
    'Ghana': [
      'Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 'Northern',
      'Upper East', 'Upper West', 'Volta', 'Western'
    ],
    'South Africa': [
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga',
      'North West', 'Northern Cape', 'Western Cape'
    ],
    'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale'],
    'India': [
      'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Gujarat', 'Rajasthan',
      'Madhya Pradesh', 'Kerala', 'West Bengal', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Punjab'
    ],
    'Australia': [
      'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia',
      'Tasmania', 'Northern Territory', 'Australian Capital Territory'
    ],
    'Germany': [
      'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse',
      'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate',
      'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
    ],
    'Other': ['Other']
  };

  const countries = Object.keys(countriesWithStates);
  const positions = ['Leader', 'Member', 'Founder'];

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassport(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'country') {
      setFormData({ ...formData, country: value, state: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check session registration status
      const selectedSession = sessions.find(s => s.id === formData.session);
      if (selectedSession) {
        if (selectedSession.registrationStatus === 'closed') {
          setShowSessionErrorModal({ type: 'closed', sessionName: selectedSession.name });
          setIsSubmitting(false);
          return;
        }
        if (selectedSession.registrationStatus === 'upcoming') {
          setShowSessionErrorModal({ type: 'upcoming', sessionName: selectedSession.name });
          setIsSubmitting(false);
          return;
        }
      }

      // Check for duplicate registration in same session
      const existingStudent = students.find(s => 
        s.email.toLowerCase() === formData.email.toLowerCase() &&
        s.session === selectedSession?.name
      );
      
      if (existingStudent) {
        setShowDuplicateModal(true);
        setIsSubmitting(false);
        return;
      }

      // Register student
      const result = addStudent({
        ...formData,
        session: selectedSession?.name || formData.session,
        profilePicture: passport || undefined,
        status: 'active',
        emailConfirmed: true // Auto-confirm email
      });

      setRegistrationResult({ registrationNumber: result.registrationNumber });
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (registrationResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h1>
            <p className="text-gray-600 mb-4 text-sm">Welcome to Light House Academy</p>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white mb-4">
              <p className="text-xs opacity-80 mb-1">Your Registration Number</p>
              <p className="text-xl font-bold tracking-wider">{registrationResult.registrationNumber}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left mb-4">
              <p className="text-yellow-800 font-medium text-sm mb-1">⚠️ Important:</p>
              <ul className="text-yellow-700 text-xs space-y-1">
                <li>• Keep your registration number safe</li>
                <li>• Use this number to login to Student Portal</li>
                <li>• This is also your password</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to="/student-login"
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg"
              >
                Login Now
              </Link>
              <button
                onClick={() => {
                  setRegistrationResult(null);
                  setPassport(null);
                  setFormData({
                    firstName: '', lastName: '', email: '', phone: '',
                    gender: '', dramaGroup: '', position: '', country: '',
                    state: '', address: '', session: '', program: 'Online Training',
                  });
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                Register Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Registration</h1>
          <p className="text-gray-600 text-sm">Join Light House Academy</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4">
          <div className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email"
              />
            </div>

            {/* Phone & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Drama Group & Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Drama Group *</label>
                <input
                  type="text"
                  name="dramaGroup"
                  value={formData.dramaGroup}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Drama group name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Position *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  disabled={!formData.country}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select</option>
                  {formData.country && countriesWithStates[formData.country]?.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Session */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Session *</label>
              <select
                name="session"
                value={formData.session}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select session</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.name} {session.registrationStatus === 'open' || session.registrationStatus === 'ongoing' 
                      ? '✅' : session.registrationStatus === 'upcoming' ? '🟡' : '🔴'}
                  </option>
                ))}
              </select>
            </div>

            {/* Passport Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Passport Photo *</label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                  {passport ? (
                    <img src={passport} alt="Passport" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center">No photo</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700">
                    {passport ? 'Change' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handlePassportChange} className="hidden" />
                  </label>
                  {passport && (
                    <button type="button" onClick={() => setPassport(null)} className="ml-2 text-red-600 text-sm">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Statement of Purpose */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Statement of Purpose *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your goals and motivations..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </button>

          <p className="mt-4 text-center text-gray-600 text-xs">
            Already registered? <Link to="/student-login" className="text-blue-600 font-medium">Login</Link>
          </p>
        </form>
      </div>

      {/* Duplicate Email Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Already Registered!</h2>
            <p className="text-gray-600 text-center text-sm mb-4">
              You're already registered for this session. Try a different session or login.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/student-login')} className="w-full py-2 bg-green-600 text-white rounded-lg font-medium">
                Login
              </button>
              <button onClick={() => setShowDuplicateModal(false)} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg">
                Try Different Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Error Modal */}
      {showSessionErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              showSessionErrorModal.type === 'closed' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {showSessionErrorModal.type === 'closed' ? (
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h2 className={`text-xl font-bold text-center mb-2 ${
              showSessionErrorModal.type === 'closed' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {showSessionErrorModal.type === 'closed' ? 'Registration Closed' : 'Not Started Yet'}
            </h2>
            <p className="text-gray-600 text-center text-sm mb-4">
              {showSessionErrorModal.type === 'closed' 
                ? 'This session has been closed.' 
                : 'The session has not started, wait patiently.'}
            </p>
            <button 
              onClick={() => setShowSessionErrorModal(null)} 
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Choose Different Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
