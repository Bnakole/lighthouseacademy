import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface RegistrationResult {
  registrationNumber: string;
  verificationCode: string;
}

interface DuplicateEmailModal {
  show: boolean;
  email: string;
}

interface SessionErrorModal {
  show: boolean;
  type: 'closed' | 'upcoming' | null;
  sessionName: string;
}

export function Registration() {
  const { addStudent, sessions, students } = useApp();
  const navigate = useNavigate();
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<DuplicateEmailModal>({ show: false, email: '' });
  const [sessionErrorModal, setSessionErrorModal] = useState<SessionErrorModal>({ show: false, type: null, sessionName: '' });
  const [passport, setPassport] = useState<string | null>(null);
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
    program: '',
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
    'Kenya': [
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale'
    ],
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

  const programs = [
    'Online Training',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check if student already registered for the SAME session
  const checkDuplicateRegistration = (email: string, sessionId: string): { isDuplicate: boolean; sameSession: boolean } => {
    const existingStudent = students.find(student => 
      student.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!existingStudent) {
      return { isDuplicate: false, sameSession: false };
    }
    
    // Check if registered for the same session
    const selectedSession = sessions.find(s => s.id === sessionId);
    if (selectedSession && existingStudent.session === selectedSession.name) {
      return { isDuplicate: true, sameSession: true };
    }
    
    // Different session - allowed
    return { isDuplicate: false, sameSession: false };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check session registration status
    const selectedSession = sessions.find(s => s.id === formData.session);
    if (selectedSession) {
      if (selectedSession.registrationStatus === 'closed') {
        setSessionErrorModal({ 
          show: true, 
          type: 'closed', 
          sessionName: selectedSession.name 
        });
        return;
      }
      if (selectedSession.registrationStatus === 'upcoming') {
        setSessionErrorModal({ 
          show: true, 
          type: 'upcoming', 
          sessionName: selectedSession.name 
        });
        return;
      }
    }
    
    // Check for duplicate registration in the same session
    const duplicateCheck = checkDuplicateRegistration(formData.email, formData.session);
    if (duplicateCheck.isDuplicate && duplicateCheck.sameSession) {
      setDuplicateModal({ show: true, email: formData.email });
      return;
    }
    
    const selectedSessionData = sessions.find(s => s.id === formData.session);
    const result = addStudent({ 
      ...formData, 
      session: selectedSessionData?.name || formData.session,
      profilePicture: passport || undefined,
      status: 'active'
    });
    setRegistrationResult(result);
  };

  const closeDuplicateModal = () => {
    setDuplicateModal({ show: false, email: '' });
  };

  const goToLogin = () => {
    navigate('/student-login');
  };

  const goToVerifyEmail = () => {
    navigate('/verify-email');
  };

  if (registrationResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h1>
            <p className="text-gray-600 mb-6">Welcome to Light House Academy. Please confirm your email to complete registration.</p>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
              <p className="text-sm opacity-80 mb-2">Your Registration Number</p>
              <p className="text-3xl font-bold tracking-wider">{registrationResult.registrationNumber}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6">
              <p className="text-sm opacity-80 mb-2">Email Verification Code</p>
              <p className="text-4xl font-bold tracking-widest">{registrationResult.verificationCode}</p>
              <p className="text-xs opacity-80 mt-2">This code has been "sent" to your email</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
              <p className="text-yellow-800 font-medium mb-2">⚠️ Important:</p>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Keep your registration number safe (Format: LHA-2026-XXXX)</li>
                <li>• Use this number to login to the Student Portal</li>
                <li>• Your registration number is your login password</li>
                <li>• <strong>You must verify your email before logging in</strong></li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/verify-email?reg=${registrationResult.registrationNumber}`}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                Verify Email Now
              </Link>
              <button
                onClick={() => {
                  setRegistrationResult(null);
                  setPassport(null);
                  setFormData({
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
                    program: '',
                  });
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Registration</h1>
          <p className="text-gray-600">Join Light House Academy today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name of Drama Group *</label>
              <input
                type="text"
                name="dramaGroup"
                value={formData.dramaGroup}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your drama group name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <select
                name="country"
                value={formData.country}
                onChange={(e) => {
                  setFormData({ ...formData, country: e.target.value, state: '' });
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={!formData.country}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
              >
                <option value="">Select state</option>
                {formData.country && countriesWithStates[formData.country]?.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select program</option>
                {programs.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session *</label>
              <select
                name="session"
                value={formData.session}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select session</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.name} {session.registrationStatus === 'open' || session.registrationStatus === 'ongoing' 
                      ? '✅' 
                      : session.registrationStatus === 'upcoming' 
                      ? '🟡' 
                      : '🔴'}
                  </option>
                ))}
              </select>
              {formData.session && (
                <p className={`text-sm mt-1 ${
                  sessions.find(s => s.id === formData.session)?.registrationStatus === 'open' || 
                  sessions.find(s => s.id === formData.session)?.registrationStatus === 'ongoing'
                    ? 'text-green-600'
                    : sessions.find(s => s.id === formData.session)?.registrationStatus === 'upcoming'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {sessions.find(s => s.id === formData.session)?.registrationStatus === 'open' && '✅ Registration is open'}
                  {sessions.find(s => s.id === formData.session)?.registrationStatus === 'ongoing' && '✅ Registration is ongoing'}
                  {sessions.find(s => s.id === formData.session)?.registrationStatus === 'upcoming' && '🟡 Registration has not started yet'}
                  {sessions.find(s => s.id === formData.session)?.registrationStatus === 'closed' && '🔴 Registration is closed'}
                </p>
              )}
            </div>

            {/* Passport Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photograph *</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Preview */}
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                  {passport ? (
                    <img src={passport} alt="Passport preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs">No photo</span>
                    </div>
                  )}
                </div>
                
                {/* Upload button and info */}
                <div className="flex-1">
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {passport ? 'Change Photo' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePassportChange}
                      className="hidden"
                    />
                  </label>
                  
                  {passport && (
                    <button
                      type="button"
                      onClick={() => setPassport(null)}
                      className="ml-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <p>• Recent passport photograph</p>
                    <p>• Clear, front-facing photo</p>
                    <p>• Max file size: 5MB (JPG, PNG)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Statement of Purpose *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Describe your goals, motivations, and what you hope to achieve from this training program..."
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Complete Registration
            </button>
          </div>

          <div className="mt-6 text-center text-gray-600 text-sm">
            Already registered?{' '}
            <Link to="/verify-email" className="text-blue-600 hover:underline font-medium">
              Verify your email
            </Link>
            {' '}or{' '}
            <Link to="/student-login" className="text-green-600 hover:underline font-medium">
              Login
            </Link>
          </div>
        </form>
      </div>

      {/* Duplicate Email Modal */}
      {duplicateModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-pulse">
            {/* Warning Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
              Already Registered for This Session!
            </h2>

            {/* Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-center">
                An account with the email address
              </p>
              <p className="text-blue-600 font-bold text-center text-lg my-2">
                {duplicateModal.email}
              </p>
              <p className="text-gray-700 text-center">
                is already registered for this session.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm text-center">
                <strong>What would you like to do?</strong>
              </p>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• If you've already verified your email, please <strong>login</strong> to access your portal.</li>
                <li>• If you haven't verified your email yet, click <strong>Verify Email</strong> to complete verification.</li>
                <li>• To register for a <strong>different session</strong>, go back and select another session.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={goToLogin}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login to Portal
              </button>
              <button
                onClick={goToVerifyEmail}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Verify Email
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={closeDuplicateModal}
              className="w-full mt-4 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Use Different Email
            </button>
          </div>
        </div>
      )}

      {/* Session Error Modal */}
      {sessionErrorModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {/* Icon */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              sessionErrorModal.type === 'closed' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {sessionErrorModal.type === 'closed' ? (
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Title */}
            <h2 className={`text-2xl font-bold text-center mb-4 ${
              sessionErrorModal.type === 'closed' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {sessionErrorModal.type === 'closed' ? 'Registration Closed' : 'Registration Not Started'}
            </h2>

            {/* Session Name */}
            <div className={`rounded-lg p-4 mb-6 ${
              sessionErrorModal.type === 'closed' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className="text-gray-700 text-center font-semibold text-lg">
                {sessionErrorModal.sessionName}
              </p>
            </div>

            {/* Message */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              {sessionErrorModal.type === 'closed' ? (
                <p className="text-gray-700 text-center">
                  <span className="text-red-600 font-bold">This session has been closed.</span>
                  <br /><br />
                  Registration is no longer available for this session. Please select a different session or contact the administrator for assistance.
                </p>
              ) : (
                <p className="text-gray-700 text-center">
                  <span className="text-yellow-600 font-bold">The session has not started, wait patiently.</span>
                  <br /><br />
                  Registration for this session has not opened yet. Please check back later or select a different session that is currently open.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setSessionErrorModal({ show: false, type: null, sessionName: '' })}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Choose Different Session
            </button>

            <Link
              to="/sessions"
              className="block w-full mt-3 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              View All Sessions
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
