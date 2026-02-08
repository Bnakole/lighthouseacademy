import { Link } from 'react-router-dom';

export function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-14 h-14 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-blue-600">Light House Academy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Illuminating paths to success through quality education and professional training
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide accessible, high-quality online training programs that empower individuals 
              with the skills and knowledge needed to excel in their chosen fields and achieve their 
              professional goals.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be a leading beacon of educational excellence, guiding learners worldwide towards 
              brighter futures through innovative online training solutions and transformative 
              learning experiences.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
            <p className="text-gray-600 leading-relaxed">
              Excellence, Integrity, Innovation, Accessibility, and Student Success. We believe 
              in creating an inclusive learning environment that nurtures growth and celebrates 
              achievement.
            </p>
          </div>
        </div>

        {/* About Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-10 text-white">
              <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
              <p className="text-blue-100 leading-relaxed mb-6">
                Light House Academy is a premier online training institution dedicated to providing 
                world-class education to students across the globe. Founded with the vision of making 
                quality education accessible to everyone, we have grown to become a trusted name in 
                online learning.
              </p>
              <p className="text-blue-100 leading-relaxed mb-6">
                Our academy brings together experienced instructors, cutting-edge curriculum, and 
                innovative teaching methods to deliver an exceptional learning experience. We believe 
                that education is the key to unlocking potential and creating opportunities.
              </p>
              <div className="flex items-center space-x-4 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">500+</div>
                  <div className="text-blue-200 text-sm">Students Trained</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">50+</div>
                  <div className="text-blue-200 text-sm">Expert Instructors</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">98%</div>
                  <div className="text-blue-200 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Offer</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Online Training Programs</h4>
                    <p className="text-gray-600">Flexible, self-paced courses designed for modern learners</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Professional Certification</h4>
                    <p className="text-gray-600">Recognized certificates upon successful completion</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Expert Instructors</h4>
                    <p className="text-gray-600">Learn from industry professionals with years of experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Interactive Learning</h4>
                    <p className="text-gray-600">Engaging content with hands-on projects and assessments</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Community Support</h4>
                    <p className="text-gray-600">Join our WhatsApp community for networking and support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2026 Training Program */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-10 text-white mb-16">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-medium mb-4">
                🎓 Now Enrolling
              </div>
              <h2 className="text-3xl font-bold mb-4">2026 Two Weeks Training Program</h2>
              <p className="text-green-100 text-lg mb-4">
                Join our intensive online training program and gain valuable skills in just two weeks. 
                This comprehensive program is designed to fast-track your learning and provide you with 
                practical knowledge you can apply immediately.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <span className="font-semibold">📅 Duration:</span> 2 Weeks
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <span className="font-semibold">💻 Mode:</span> Online
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <span className="font-semibold">💰 Price:</span> <span className="text-yellow-300 font-bold">FREE</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 text-center">
              <Link
                to="/register"
                className="inline-block bg-white text-green-600 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors shadow-lg text-lg"
              >
                Register Now →
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
              <p className="text-gray-600">info@lighthouseacademy.com</p>
              <p className="text-gray-600">support@lighthouseacademy.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">WhatsApp</h4>
              <a
                href="https://t.me/+k7GOXSYPzYozNjM0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Join Our Community →
              </a>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
              <p className="text-gray-600">Online Training Platform</p>
              <p className="text-gray-600">Available Worldwide</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            © 2026 Light House Academy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
