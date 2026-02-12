import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessions, getCountries, registerStudent, fileToBase64 } from '../store';
import { UserPlus, Camera, ArrowRight, AlertCircle, CheckCircle2, CreditCard, Upload } from 'lucide-react';

export function Registration() {
  const navigate = useNavigate();
  const sessions = getSessions();
  const countries = getCountries();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dramaGroup: '', position: 'Member',
    country: '', state: '', sessionId: '', passport: '', paymentReceipt: ''
  });
  const [showPayment, setShowPayment] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const states = form.country ? (countries[form.country] || []) : [];
  const openSessions = sessions.filter(s => s.status === 'open' || s.status === 'ongoing');

  const handlePassport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const data = await fileToBase64(file);
      setForm(f => ({ ...f, passport: data }));
    }
  };

  const handlePaymentReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const data = await fileToBase64(file);
      setForm(f => ({ ...f, paymentReceipt: data }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!form.sessionId) {
      setMessage({ type: 'error', text: 'Please select a session' });
      setLoading(false);
      return;
    }

    const session = sessions.find(s => s.id === form.sessionId);
    if (session) {
      if (session.status === 'closed') {
        setMessage({ type: 'error', text: 'This session has been closed.' });
        setLoading(false);
        return;
      }
      if (session.status === 'upcoming') {
        setMessage({ type: 'error', text: 'The session has not started, wait patiently.' });
        setLoading(false);
        return;
      }
      
      // Check if payment is required
      if (session.price !== 'Free' && !form.paymentReceipt) {
        setShowPayment(true);
        setMessage({ type: 'error', text: 'Please upload payment receipt for this paid session.' });
        setLoading(false);
        return;
      }
    }

    const result = registerStudent({
      fullName: form.fullName, email: form.email, phone: form.phone,
      dramaGroup: form.dramaGroup, position: form.position, country: form.country,
      state: form.state, passport: form.passport, sessions: [form.sessionId],
      paymentReceipt: form.paymentReceipt, 
      registrationApproved: false,
      paymentStatus: session?.price === 'Free' ? 'verified' : 'unverified'
    });

    if (result.success) {
      if (session?.price === 'Free') {
        setMessage({ 
          type: 'success', 
          text: 'Congratulations! Registration successful. Your registration number has been sent to your email. Please wait for admin approval before accessing the student portal.'
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Congratulations! Registration submitted successfully. Please wait patiently for payment verification and admin approval. You will receive your registration number via email once approved.'
        });
      }
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  };

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="card-premium">
        {/* Header */}
        <div className="gradient-primary p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shadow-lg">
              <UserPlus size={24} className="text-primary-dark" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Student Registration</h1>
              <p className="text-white/50 text-sm mt-1">Join Light House Academy today</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          {message && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl mb-6 scale-in ${
              message.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                  {message.text}
                </p>
                {message.type === 'error' && message.text.includes('account') && (
                  <button onClick={() => navigate('/student-login')} 
                    className="mt-3 btn-primary text-xs py-2 px-4">
                    Go to Student Login <ArrowRight size={14} />
                  </button>
                )}
                {message.type === 'success' && (
                  <button onClick={() => navigate('/student-login')} 
                    className="mt-3 btn-success text-xs py-2 px-4 flex items-center gap-1">
                    Go to Student Login <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Passport Upload */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('passport-input')?.click()}>
                {form.passport ? (
                  <img src={form.passport} alt="Passport" className="w-28 h-28 rounded-full object-cover avatar-ring shadow-xl" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center border-3 border-dashed border-gray-300 group-hover:border-indigo-400 transition-all">
                    <Camera size={28} className="text-gray-400 group-hover:text-indigo-500 transition" />
                    <span className="text-[10px] text-gray-400 mt-1 font-medium">Upload Photo</span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-accent flex items-center justify-center shadow-lg">
                  <Camera size={14} className="text-white" />
                </div>
              </div>
              <input id="passport-input" type="file" accept="image/*" onChange={handlePassport} className="hidden" />
              <p className="text-xs text-gray-400 mt-2">Upload passport photo</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name *</label>
              <input type="text" required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Enter your full name"
                className="input-premium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Phone Number *</label>
                <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+234..."
                  className="input-premium" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Name of Drama Group</label>
                <input type="text" value={form.dramaGroup} onChange={e => setForm(f => ({ ...f, dramaGroup: e.target.value }))}
                  placeholder="Your drama group"
                  className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Position</label>
                <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  className="select-premium">
                  <option value="Member">Member</option>
                  <option value="Leader">Leader</option>
                  <option value="Founder">Founder</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Country *</label>
                <select required value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value, state: '' }))}
                  className="select-premium">
                  <option value="">Select Country</option>
                  {Object.keys(countries).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">State *</label>
                <select required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="select-premium">
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Select Session *</label>
              <select required value={form.sessionId} 
                onChange={e => {
                  const sessionId = e.target.value;
                  setForm(f => ({ ...f, sessionId }));
                  const session = sessions.find(s => s.id === sessionId);
                  if (session && session.price !== 'Free') {
                    setShowPayment(true);
                  } else {
                    setShowPayment(false);
                  }
                }}
                className="select-premium">
                <option value="">Choose a session</option>
                {openSessions.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.price}</option>
                ))}
              </select>
              {sessions.filter(s => s.status === 'upcoming').length > 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Some sessions are upcoming and not yet open for registration.
                </p>
              )}
            </div>

            {/* Payment Section */}
            {showPayment && (
              <div className="fade-in space-y-4">
                <div className="section-divider" />
                
                <div className="payment-card p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-yellow-600" />
                    Payment Required
                  </h3>
                  
                  <div className="bg-white/80 backdrop-blur rounded-xl p-5 space-y-3 border border-yellow-200">
                    <h4 className="font-semibold text-gray-700 text-sm">Bank Account Details:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium text-gray-500 w-20">Bank:</span>
                        <span className="text-sm font-bold text-gray-800">OPAY</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium text-gray-500 w-20">Account No:</span>
                        <span className="text-sm font-bold text-gray-800">8080498742</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-medium text-gray-500 w-20">Account Name:</span>
                        <span className="text-sm font-bold text-gray-800">LIGHT HOUSE ACADEMY</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Upload Payment Receipt *
                    </label>
                    <div className="file-upload-zone relative">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handlePaymentReceipt}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        required={showPayment}
                      />
                      <div className="flex flex-col items-center py-8">
                        <Upload size={32} className="text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-600">
                          {form.paymentReceipt ? 'Receipt uploaded ✓' : 'Click to upload receipt'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Image or PDF (Max 5MB)</p>
                      </div>
                    </div>
                    {form.paymentReceipt && (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Payment receipt uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="section-divider" />

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                <>
                  <UserPlus size={18} />
                  Complete Registration
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
