import React from 'react';

// Feature Components that can be dynamically added

export const AnnouncementBanner: React.FC<{ text: string; type: 'info' | 'warning' | 'success' | 'error' }> = ({ text, type }) => {
  const colors = {
    info: 'bg-blue-600',
    warning: 'bg-yellow-500',
    success: 'bg-green-600',
    error: 'bg-red-600'
  };
  
  return (
    <div className={`${colors[type]} text-white py-2 px-4 text-center font-medium`}>
      {text}
    </div>
  );
};

export const CountdownTimer: React.FC<{ targetDate: string; label: string }> = ({ targetDate, label }) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 text-center">
      <p className="text-sm mb-2">{label}</p>
      <div className="flex justify-center gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="bg-white/20 rounded-lg px-3 py-2">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs block capitalize">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Testimonials: React.FC<{ testimonials: Array<{ name: string; text: string; image?: string }> }> = ({ testimonials }) => {
  return (
    <div className="bg-gray-100 py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Students Say</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {t.image ? <img src={t.image} alt={t.name} className="w-full h-full rounded-full object-cover" /> : t.name[0]}
              </div>
              <span className="font-semibold">{t.name}</span>
            </div>
            <p className="text-gray-600 italic">"{t.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FAQ: React.FC<{ items: Array<{ question: string; answer: string }> }> = ({ items }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="bg-white py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button
              className="w-full px-6 py-4 text-left font-medium flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {item.question}
              <span className="text-xl">{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && (
              <div className="px-6 py-4 text-gray-600 border-t">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SocialLinks: React.FC<{ links: { facebook?: string; twitter?: string; instagram?: string; youtube?: string; whatsapp?: string; telegram?: string } }> = ({ links }) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {links.whatsapp && (
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <span className="text-xl">💬</span>
        </a>
      )}
      {links.telegram && (
        <a href={links.telegram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <span className="text-xl">✈️</span>
        </a>
      )}
      {links.instagram && (
        <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <span className="text-xl">📷</span>
        </a>
      )}
      {links.youtube && (
        <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <span className="text-xl">▶️</span>
        </a>
      )}
    </div>
  );
};

export const ProgressTracker: React.FC<{ studentId: string; progress: number }> = ({ progress }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-lg mb-4">Your Progress</h3>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center mt-2 font-semibold text-gray-700">{progress}% Complete</p>
    </div>
  );
};

export const NotificationBell: React.FC<{ count: number; onClick: () => void }> = ({ count, onClick }) => {
  return (
    <button onClick={onClick} className="relative">
      <span className="text-2xl">🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

export const WelcomePopup: React.FC<{ title: string; message: string; buttonText: string; onClose: () => void }> = ({ title, message, buttonText, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-bounce-once">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export const LiveChat: React.FC<{ agentName: string; agentImage?: string }> = ({ agentName, agentImage }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ text: string; isUser: boolean }>>([
    { text: `Hi! I'm ${agentName}. How can I help you today?`, isUser: false }
  ]);
  const [input, setInput] = React.useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, isUser: true }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Thanks for your message! Our team will respond shortly.", isUser: false }]);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-50"
      >
        {isOpen ? '✕' : '💬'}
      </button>
      
      {isOpen && (
        <div className="fixed bottom-20 left-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {agentImage ? <img src={agentImage} alt={agentName} className="w-full h-full rounded-full object-cover" /> : '👤'}
            </div>
            <div>
              <p className="font-semibold">{agentName}</p>
              <p className="text-xs text-white/80">Online</p>
            </div>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-xl ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const Gallery: React.FC<{ images: Array<{ src: string; caption?: string }> }> = ({ images }) => {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);

  return (
    <div className="bg-gray-100 py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {images.map((img, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelectedImage(i)}
          >
            <img src={img.src} alt={img.caption || ''} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl w-full">
            <img src={images[selectedImage].src} alt="" className="w-full rounded-xl" />
            {images[selectedImage].caption && (
              <p className="text-white text-center mt-4">{images[selectedImage].caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const EventCalendar: React.FC<{ events: Array<{ date: string; title: string; description?: string }> }> = ({ events }) => {
  return (
    <div className="bg-white py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Upcoming Events</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4 p-4 border-l-4 border-blue-600 bg-blue-50 rounded-r-xl">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-xl flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{new Date(event.date).getDate()}</span>
              <span className="text-xs">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{event.title}</h3>
              {event.description && <p className="text-gray-600">{event.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Newsletter: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 px-4">
      <div className="max-w-2xl mx-auto text-center text-white">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="mb-6 text-white/80">{description}</p>
        
        {subscribed ? (
          <div className="bg-white/20 rounded-xl p-6">
            <span className="text-4xl">✅</span>
            <p className="font-semibold mt-2">Thank you for subscribing!</p>
          </div>
        ) : (
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800"
            />
            <button
              onClick={handleSubscribe}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Subscribe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Leaderboard: React.FC<{ students: Array<{ name: string; points: number; image?: string }> }> = ({ students }) => {
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        🏆 Leaderboard
      </h3>
      <div className="space-y-3">
        {sortedStudents.slice(0, 10).map((student, i) => (
          <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${i < 3 ? 'bg-gradient-to-r from-yellow-100 to-yellow-50' : 'bg-gray-50'}`}>
            <span className={`text-2xl ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}`}>
              {i >= 3 && <span className="font-bold text-gray-500">#{i + 1}</span>}
            </span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {student.image ? <img src={student.image} alt={student.name} className="w-full h-full rounded-full object-cover" /> : student.name[0]}
            </div>
            <span className="font-medium flex-1">{student.name}</span>
            <span className="font-bold text-blue-600">{student.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature Registry - all available features
export const FeatureRegistry = {
  announcementBanner: {
    name: 'Announcement Banner',
    description: 'Display important announcements at the top of pages',
    component: AnnouncementBanner,
    defaultConfig: { text: 'Welcome to Light House Academy!', type: 'info' }
  },
  countdownTimer: {
    name: 'Countdown Timer',
    description: 'Show countdown to an event or deadline',
    component: CountdownTimer,
    defaultConfig: { targetDate: '2026-01-06', label: 'Training Starts In:' }
  },
  testimonials: {
    name: 'Testimonials',
    description: 'Display student testimonials and reviews',
    component: Testimonials,
    defaultConfig: { testimonials: [] }
  },
  faq: {
    name: 'FAQ Section',
    description: 'Frequently asked questions accordion',
    component: FAQ,
    defaultConfig: { items: [] }
  },
  socialLinks: {
    name: 'Social Media Links',
    description: 'Floating social media buttons',
    component: SocialLinks,
    defaultConfig: { links: {} }
  },
  liveChat: {
    name: 'Live Chat',
    description: 'Live chat widget for visitor support',
    component: LiveChat,
    defaultConfig: { agentName: 'Support' }
  },
  gallery: {
    name: 'Image Gallery',
    description: 'Display images in a gallery format',
    component: Gallery,
    defaultConfig: { images: [] }
  },
  eventCalendar: {
    name: 'Event Calendar',
    description: 'Show upcoming events and dates',
    component: EventCalendar,
    defaultConfig: { events: [] }
  },
  newsletter: {
    name: 'Newsletter Signup',
    description: 'Email subscription form',
    component: Newsletter,
    defaultConfig: { title: 'Stay Updated', description: 'Subscribe to our newsletter' }
  },
  welcomePopup: {
    name: 'Welcome Popup',
    description: 'Show a welcome message to visitors',
    component: WelcomePopup,
    defaultConfig: { title: 'Welcome!', message: 'Thanks for visiting', buttonText: 'Get Started' }
  },
  progressTracker: {
    name: 'Progress Tracker',
    description: 'Show student learning progress',
    component: ProgressTracker,
    defaultConfig: { progress: 0 }
  },
  leaderboard: {
    name: 'Leaderboard',
    description: 'Display top students',
    component: Leaderboard,
    defaultConfig: { students: [] }
  }
};

export type FeatureType = keyof typeof FeatureRegistry;
