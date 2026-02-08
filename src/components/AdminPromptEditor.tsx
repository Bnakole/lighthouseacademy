import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface PromptMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  changes?: SiteChange[];
}

interface SiteChange {
  type: 'content' | 'style' | 'setting' | 'session' | 'navigation';
  description: string;
  applied: boolean;
  data?: any;
}

const AdminPromptEditor: React.FC = () => {
  const { 
    siteSettings, 
    updateSiteSettings, 
    sessions, 
    addSession, 
    updateSession, 
    deleteSession,
    students 
  } = useApp();
  
  const [messages, setMessages] = useState<PromptMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Welcome to the Light House Academy AI Editor!

I can help you make changes to your site using natural language. Here are some things you can ask me:

**🎨 Site Settings:**
• "Change the site name to [new name]"
• "Update the site logo"
• "Change the primary color to [color]"

**📅 Sessions:**
• "Create a new session called [name]"
• "Change the price of [session] to [amount]"
• "Close registration for [session]"
• "Open registration for [session]"
• "Add a facilitator named [name] to [session]"

**📝 Content:**
• "Update the welcome message to [text]"
• "Change the about us description"
• "Update contact information"

**👥 Students:**
• "Make [student name] a leader"
• "Remove leader status from [student]"

**⚙️ Features:**
• "Enable/disable AI chat for students"
• "Change secretary password to [password]"

Just type what you want to change and I'll help you do it!`,
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [customSettings, setCustomSettings] = useState<any>(() => {
    const saved = localStorage.getItem('lha_custom_settings');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      welcomeMessage: 'Welcome to Light House Academy',
      aboutDescription: '',
      contactEmail: 'info@lighthouseacademy.com',
      contactPhone: '',
      secretaryPassword: 'SECRETARY2026',
      scoPassword: 'SCO2026',
      adminPassword: 'LHA2026',
      enableAIChat: true,
      customAnnouncement: '',
      footerText: '© 2026 Light House Academy. All rights reserved.'
    };
  });

  useEffect(() => {
    localStorage.setItem('lha_custom_settings', JSON.stringify(customSettings));
  }, [customSettings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processPrompt = async (userPrompt: string) => {
    const prompt = userPrompt.toLowerCase();
    const changes: SiteChange[] = [];
    let response = '';

    // Site Name Changes
    if (prompt.includes('change') && (prompt.includes('site name') || prompt.includes('name of the site') || prompt.includes('website name'))) {
      const nameMatch = userPrompt.match(/to\s+["']?([^"']+)["']?$/i) || userPrompt.match(/["']([^"']+)["']/);
      if (nameMatch) {
        const newName = nameMatch[1].trim();
        updateSiteSettings({ ...siteSettings, siteName: newName });
        changes.push({ type: 'setting', description: `Changed site name to "${newName}"`, applied: true });
        response = `✅ Done! I've changed the site name to "${newName}". The change is now live across all pages.`;
      } else {
        response = `What would you like to change the site name to? Please specify like: "Change the site name to My New Academy"`;
      }
    }
    
    // Session Creation
    else if (prompt.includes('create') && (prompt.includes('session') || prompt.includes('training'))) {
      const nameMatch = userPrompt.match(/called\s+["']?([^"']+)["']?/i) || 
                        userPrompt.match(/named\s+["']?([^"']+)["']?/i) ||
                        userPrompt.match(/session\s+["']?([^"']+)["']?/i);
      if (nameMatch) {
        const sessionName = nameMatch[1].trim();
        const priceMatch = userPrompt.match(/price\s+(?:of\s+)?["']?([^"']+)["']?/i) ||
                          userPrompt.match(/(?:for\s+)?(\$?\d+|\bfree\b)/i);
        const price = priceMatch ? priceMatch[1] : 'Free';
        
        const newSession = {
          id: `session-${Date.now()}`,
          name: sessionName,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'upcoming' as const,
          registrationStatus: 'upcoming' as const,
          price: price,
          description: '',
          facilitators: []
        };
        
        addSession(newSession);
        changes.push({ type: 'session', description: `Created new session "${sessionName}"`, applied: true, data: newSession });
        response = `✅ Done! I've created a new session called "${sessionName}" with price: ${price}.

📅 The session is set to start today and run for 2 weeks. You can edit the dates in the Sessions tab.

Would you like me to:
• Change the dates?
• Add facilitators?
• Set a description?
• Open registration?`;
      } else {
        response = `I'd be happy to create a new session! Please tell me the name, like: "Create a session called December Training"`;
      }
    }
    
    // Change Session Price
    else if (prompt.includes('price') && prompt.includes('session')) {
      const priceMatch = userPrompt.match(/to\s+["']?(\$?\d+|free)["']?/i);
      const sessionMatch = userPrompt.match(/(?:for|of)\s+["']?([^"']+?)["']?\s+(?:to|session)/i);
      
      if (priceMatch) {
        const newPrice = priceMatch[1];
        const sessionName = sessionMatch ? sessionMatch[1] : null;
        
        if (sessionName) {
          const session = sessions.find(s => s.name.toLowerCase().includes(sessionName.toLowerCase()));
          if (session) {
            updateSession(session.id, { ...session, price: newPrice });
            changes.push({ type: 'session', description: `Changed price of "${session.name}" to ${newPrice}`, applied: true });
            response = `✅ Done! The price for "${session.name}" has been changed to ${newPrice}.`;
          } else {
            response = `I couldn't find a session matching "${sessionName}". Available sessions are:\n${sessions.map(s => `• ${s.name}`).join('\n')}`;
          }
        } else {
          response = `Which session would you like to change the price for? Available sessions:\n${sessions.map(s => `• ${s.name} (currently: ${s.price || 'Free'})`).join('\n')}`;
        }
      }
    }
    
    // Open/Close Registration
    else if ((prompt.includes('open') || prompt.includes('close')) && prompt.includes('registration')) {
      const isOpen = prompt.includes('open');
      const sessionName = userPrompt.match(/for\s+["']?([^"']+)["']?/i);
      
      if (sessionName) {
        const session = sessions.find(s => s.name.toLowerCase().includes(sessionName[1].toLowerCase()));
        if (session) {
          const newStatus = isOpen ? 'open' : 'closed';
          updateSession(session.id, { ...session, registrationStatus: newStatus as any });
          changes.push({ type: 'session', description: `${isOpen ? 'Opened' : 'Closed'} registration for "${session.name}"`, applied: true });
          response = `✅ Done! Registration for "${session.name}" is now ${newStatus.toUpperCase()}.`;
        } else {
          response = `I couldn't find that session. Available sessions:\n${sessions.map(s => `• ${s.name}`).join('\n')}`;
        }
      } else {
        response = `Which session would you like to ${isOpen ? 'open' : 'close'} registration for?\n${sessions.map(s => `• ${s.name} (currently: ${s.registrationStatus})`).join('\n')}`;
      }
    }
    
    // Make Student Leader
    else if (prompt.includes('leader') && (prompt.includes('make') || prompt.includes('appoint'))) {
      const nameMatch = userPrompt.match(/(?:make|appoint)\s+["']?([^"']+?)["']?\s+(?:a\s+)?leader/i);
      if (nameMatch) {
        const studentName = nameMatch[1].trim();
        const student = students.find(s => 
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentName.toLowerCase()) ||
          s.firstName.toLowerCase().includes(studentName.toLowerCase())
        );
        
        if (student) {
          // Note: This would need updateStudent function in context
          changes.push({ type: 'setting', description: `Appointed "${student.firstName} ${student.lastName}" as a leader`, applied: false });
          response = `📋 To make "${student.firstName} ${student.lastName}" a leader:
          
1. Go to the **Students** tab
2. Find the student in the list
3. Click the "Make Leader" button next to their name

I've noted this request. The admin portal has the full controls for managing leaders.`;
        } else {
          response = `I couldn't find a student named "${studentName}". Please check the spelling or provide the full name.`;
        }
      }
    }
    
    // Change Password
    else if (prompt.includes('password') && prompt.includes('change')) {
      const roleMatch = prompt.match(/(secretary|sco|admin)/i);
      const newPassMatch = userPrompt.match(/to\s+["']?([^"'\s]+)["']?$/i);
      
      if (roleMatch && newPassMatch) {
        const role = roleMatch[1].toLowerCase();
        const newPass = newPassMatch[1];
        
        if (role === 'secretary') {
          setCustomSettings((prev: any) => ({ ...prev, secretaryPassword: newPass }));
          changes.push({ type: 'setting', description: `Changed Secretary password`, applied: true });
          response = `✅ Done! The Secretary password has been changed to "${newPass}".

⚠️ **Important:** Please update the SecretaryPortal.tsx file with the new password, or inform the Secretary of the new login credentials.`;
        } else if (role === 'sco') {
          setCustomSettings((prev: any) => ({ ...prev, scoPassword: newPass }));
          changes.push({ type: 'setting', description: `Changed SCO password`, applied: true });
          response = `✅ Done! The SCO password has been changed to "${newPass}".`;
        } else if (role === 'admin') {
          setCustomSettings((prev: any) => ({ ...prev, adminPassword: newPass }));
          changes.push({ type: 'setting', description: `Changed Admin password`, applied: true });
          response = `✅ Done! The Admin password has been changed to "${newPass}".`;
        }
      } else {
        response = `Which password would you like to change? Please specify like:
• "Change secretary password to NewPass123"
• "Change SCO password to NewPass456"
• "Change admin password to NewPass789"`;
      }
    }
    
    // Welcome Message
    else if (prompt.includes('welcome') && (prompt.includes('message') || prompt.includes('change') || prompt.includes('update'))) {
      const messageMatch = userPrompt.match(/to\s+["']?(.+)["']?$/i);
      if (messageMatch) {
        const newMessage = messageMatch[1].trim().replace(/["']$/, '');
        setCustomSettings((prev: any) => ({ ...prev, welcomeMessage: newMessage }));
        changes.push({ type: 'content', description: `Updated welcome message`, applied: true });
        response = `✅ Done! The welcome message has been updated to:\n\n"${newMessage}"`;
      } else {
        response = `What would you like the welcome message to say? For example:\n"Change the welcome message to Welcome to our amazing academy!"`;
      }
    }
    
    // Add Announcement
    else if (prompt.includes('announcement') || prompt.includes('announce')) {
      const textMatch = userPrompt.match(/(?:announcement|announce)\s*[:.]?\s*["']?(.+)["']?$/i);
      if (textMatch) {
        const announcement = textMatch[1].trim().replace(/["']$/, '');
        setCustomSettings((prev: any) => ({ ...prev, customAnnouncement: announcement }));
        changes.push({ type: 'content', description: `Added announcement`, applied: true });
        response = `✅ Done! I've added the announcement:\n\n"${announcement}"\n\nThis will appear on the dashboard.`;
      } else {
        response = `What would you like to announce? For example:\n"Add announcement: Registration closes on Friday!"`;
      }
    }
    
    // Remove Announcement
    else if (prompt.includes('remove') && prompt.includes('announcement')) {
      setCustomSettings((prev: any) => ({ ...prev, customAnnouncement: '' }));
      changes.push({ type: 'content', description: `Removed announcement`, applied: true });
      response = `✅ Done! The announcement has been removed.`;
    }
    
    // Enable/Disable AI Chat
    else if ((prompt.includes('enable') || prompt.includes('disable')) && prompt.includes('ai')) {
      const enable = prompt.includes('enable');
      setCustomSettings((prev: any) => ({ ...prev, enableAIChat: enable }));
      changes.push({ type: 'setting', description: `${enable ? 'Enabled' : 'Disabled'} AI chat for students`, applied: true });
      response = `✅ Done! AI chat for students has been ${enable ? 'enabled' : 'disabled'}.`;
    }
    
    // Change Primary Color
    else if (prompt.includes('color') && (prompt.includes('primary') || prompt.includes('main') || prompt.includes('theme'))) {
      const colorMatch = userPrompt.match(/to\s+["']?([#\w]+)["']?$/i);
      if (colorMatch) {
        const color = colorMatch[1];
        setCustomSettings((prev: any) => ({ ...prev, primaryColor: color }));
        changes.push({ type: 'style', description: `Changed primary color to ${color}`, applied: true });
        response = `✅ Done! The primary color has been changed to ${color}.

Note: Some color changes may require a page refresh to take full effect.`;
      } else {
        response = `What color would you like? You can use:
• Color names: "blue", "red", "green"
• Hex codes: "#3B82F6", "#FF5733"

Example: "Change the primary color to #3B82F6"`;
      }
    }
    
    // Add Facilitator
    else if (prompt.includes('facilitator') && prompt.includes('add')) {
      const nameMatch = userPrompt.match(/(?:named|called)\s+["']?([^"']+?)["']?\s+(?:to|for)/i);
      const sessionMatch = userPrompt.match(/(?:to|for)\s+["']?([^"']+)["']?$/i);
      
      if (nameMatch && sessionMatch) {
        const facilitatorName = nameMatch[1].trim();
        const sessionName = sessionMatch[1].trim();
        
        const session = sessions.find(s => s.name.toLowerCase().includes(sessionName.toLowerCase()));
        if (session) {
          const newFacilitator = {
            id: `fac-${Date.now()}`,
            name: facilitatorName,
            role: 'Facilitator',
            photo: ''
          };
          const updatedFacilitators = [...(session.facilitators || []), newFacilitator];
          updateSession(session.id, { ...session, facilitators: updatedFacilitators });
          changes.push({ type: 'session', description: `Added facilitator "${facilitatorName}" to "${session.name}"`, applied: true });
          response = `✅ Done! I've added "${facilitatorName}" as a facilitator for "${session.name}".

Would you like me to:
• Add their role/title? Say: "Set role for ${facilitatorName} to Lead Instructor"
• Add another facilitator?`;
        } else {
          response = `I couldn't find that session. Available sessions:\n${sessions.map(s => `• ${s.name}`).join('\n')}`;
        }
      } else {
        response = `To add a facilitator, please specify both the name and session. Example:\n"Add facilitator named John Doe to 2026 Two Weeks Training"`;
      }
    }
    
    // Session Description
    else if (prompt.includes('description') && prompt.includes('session')) {
      const sessionMatch = userPrompt.match(/(?:for|of)\s+["']?([^"']+?)["']?\s+(?:to|session)/i);
      const descMatch = userPrompt.match(/to\s+["']?(.+)["']?$/i);
      
      if (sessionMatch && descMatch) {
        const sessionName = sessionMatch[1].trim();
        const description = descMatch[1].trim().replace(/["']$/, '');
        
        const session = sessions.find(s => s.name.toLowerCase().includes(sessionName.toLowerCase()));
        if (session) {
          updateSession(session.id, { ...session, description });
          changes.push({ type: 'session', description: `Updated description for "${session.name}"`, applied: true });
          response = `✅ Done! I've updated the description for "${session.name}".`;
        }
      }
    }
    
    // Delete Session
    else if (prompt.includes('delete') && prompt.includes('session')) {
      const sessionMatch = userPrompt.match(/session\s+["']?([^"']+)["']?/i);
      if (sessionMatch) {
        const sessionName = sessionMatch[1].trim();
        const session = sessions.find(s => s.name.toLowerCase().includes(sessionName.toLowerCase()));
        if (session) {
          deleteSession(session.id);
          changes.push({ type: 'session', description: `Deleted session "${session.name}"`, applied: true });
          response = `✅ Done! The session "${session.name}" has been deleted.`;
        }
      }
    }
    
    // Contact Info
    else if (prompt.includes('contact') && (prompt.includes('email') || prompt.includes('phone'))) {
      if (prompt.includes('email')) {
        const emailMatch = userPrompt.match(/to\s+["']?([^\s"']+@[^\s"']+)["']?/i);
        if (emailMatch) {
          setCustomSettings((prev: any) => ({ ...prev, contactEmail: emailMatch[1] }));
          changes.push({ type: 'content', description: `Updated contact email`, applied: true });
          response = `✅ Done! Contact email has been updated to ${emailMatch[1]}`;
        }
      } else if (prompt.includes('phone')) {
        const phoneMatch = userPrompt.match(/to\s+["']?([+\d\s-]+)["']?/i);
        if (phoneMatch) {
          setCustomSettings((prev: any) => ({ ...prev, contactPhone: phoneMatch[1] }));
          changes.push({ type: 'content', description: `Updated contact phone`, applied: true });
          response = `✅ Done! Contact phone has been updated to ${phoneMatch[1]}`;
        }
      }
    }
    
    // Show current settings
    else if (prompt.includes('show') && (prompt.includes('settings') || prompt.includes('current'))) {
      response = `📋 **Current Site Settings:**

**Site Name:** ${siteSettings?.siteName || 'Light House Academy'}
**Primary Color:** ${customSettings.primaryColor}
**Welcome Message:** ${customSettings.welcomeMessage}
**Contact Email:** ${customSettings.contactEmail}
**Contact Phone:** ${customSettings.contactPhone || 'Not set'}
**AI Chat:** ${customSettings.enableAIChat ? 'Enabled' : 'Disabled'}
**Announcement:** ${customSettings.customAnnouncement || 'None'}

**Sessions (${sessions.length}):**
${sessions.map(s => `• ${s.name} - ${s.registrationStatus} - ${s.price || 'Free'}`).join('\n')}

**Students:** ${students.length} registered

What would you like to change?`;
    }
    
    // Help
    else if (prompt.includes('help') || prompt.includes('what can you do')) {
      response = `I can help you manage your site! Here are some things you can ask:

**📛 Site Settings:**
• "Change the site name to [name]"
• "Change the primary color to [color]"
• "Show current settings"

**📅 Sessions:**
• "Create a session called [name]"
• "Change the price of [session] to [amount]"
• "Open/Close registration for [session]"
• "Add facilitator named [name] to [session]"
• "Delete session [name]"

**📣 Announcements:**
• "Add announcement: [your message]"
• "Remove announcement"

**🔐 Passwords:**
• "Change secretary password to [password]"
• "Change SCO password to [password]"
• "Change admin password to [password]"

**📧 Contact:**
• "Change contact email to [email]"
• "Change contact phone to [phone]"

**🤖 Features:**
• "Enable/Disable AI chat"

**👑 Leaders:**
• "Make [student name] a leader"

Just type naturally and I'll understand!`;
    }
    
    // Add Countdown Timer
    else if (prompt.includes('countdown') && (prompt.includes('add') || prompt.includes('enable'))) {
      const dateMatch = userPrompt.match(/(?:to|for|until|date)\s+[\"']?(\d{4}-\d{2}-\d{2})[\"']?/i);
      const labelMatch = userPrompt.match(/label\s+[\"']?([^\"']+)[\"']?/i);
      
      const newFeature = {
        id: `feature-${Date.now()}`,
        type: 'countdownTimer',
        enabled: true,
        config: {
          targetDate: dateMatch ? dateMatch[1] : '2026-01-06',
          label: labelMatch ? labelMatch[1] : 'Training Starts In:'
        },
        placement: 'dashboard' as const,
        createdAt: new Date().toISOString()
      };
      
      const existingFeatures = siteSettings.features || [];
      const filtered = existingFeatures.filter(f => f.type !== 'countdownTimer');
      updateSiteSettings({ ...siteSettings, features: [...filtered, newFeature] });
      
      changes.push({ type: 'setting', description: 'Added countdown timer to homepage', applied: true });
      response = `✅ Done! I've added a countdown timer to the homepage.\n\n⏱️ **Target Date:** ${newFeature.config.targetDate}\n📝 **Label:** ${newFeature.config.label}`;
    }
    
    // Add Social Links
    else if (prompt.includes('social') && (prompt.includes('add') || prompt.includes('enable') || prompt.includes('link'))) {
      const telegramMatch = userPrompt.match(/telegram\s*[:=]?\s*[\"']?([^\"'\s,]+)[\"']?/i);
      
      const socialLinks = {
        telegram: telegramMatch ? telegramMatch[1] : 'https://t.me/+k7GOXSYPzYozNjM0',
        whatsapp: '',
        instagram: '',
        youtube: ''
      };
      
      updateSiteSettings({ ...siteSettings, socialLinks });
      
      changes.push({ type: 'setting', description: 'Added social media buttons', applied: true });
      response = `✅ Done! Social media buttons have been added.`;
    }
    
    // Add Announcement Banner
    else if (prompt.includes('banner') && prompt.includes('add')) {
      const messageMatch = userPrompt.match(/(?:message|text|with)\s*[:=]?\s*[\"']?(.+?)[\"']?\s*$/i);
      const bannerText = messageMatch ? messageMatch[1].trim() : 'Welcome to Light House Academy!';
      
      updateSiteSettings({ ...siteSettings, announcement: bannerText, announcementType: 'info' });
      
      changes.push({ type: 'content', description: 'Added announcement banner', applied: true });
      response = `✅ Done! Announcement banner added: "${bannerText}"`;
    }
    
    // Show Features
    else if (prompt.includes('features') && (prompt.includes('show') || prompt.includes('list'))) {
      const enabledFeatures = siteSettings.features?.filter(f => f.enabled) || [];
      response = `✨ **Available Features:**\n\n${enabledFeatures.length > 0 ? enabledFeatures.map(f => `• ${f.type}`).join('\n') : 'No advanced features enabled'}\n\n**Add with:**\n• "Add countdown timer"\n• "Add social links"\n• "Add announcement banner with [message]"`;
    }
    
    // Default response
    else {
      response = `I'm not sure how to help with that specific request. Here are some things I can do:

• Change site name, colors, or settings
• Create, update, or delete sessions
• Open/close registration
• Add facilitators to sessions
• Update contact information
• Manage announcements
• Change passwords

Try being more specific, or type "help" to see all available commands!`;
    }

    return { response, changes };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: PromptMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const { response, changes } = await processPrompt(input);
      
      const assistantMessage: PromptMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        changes
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: PromptMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsProcessing(false);
  };

  const quickCommands = [
    "Show current settings",
    "Create a new session",
    "Open registration",
    "Add announcement",
    "Help"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h1 className="text-xl font-bold">AI Site Editor</h1>
              <p className="text-purple-200 text-sm">Make changes using natural language</p>
            </div>
          </div>
          <a 
            href="#/admin-portal" 
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            ← Back to Admin
          </a>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Quick Commands */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-2">Quick:</span>
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => setInput(cmd)}
              className="text-sm bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {message.changes && message.changes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold mb-2 text-gray-600">Changes Made:</p>
                      {message.changes.map((change, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className={change.applied ? 'text-green-600' : 'text-yellow-600'}>
                            {change.applied ? '✅' : '⏳'}
                          </span>
                          <span>{change.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-bounce">🤖</div>
                    <span className="text-gray-500 text-sm">Processing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type what you want to change... (e.g., 'Create a new session called March Training')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isProcessing ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Connected to Light House Academy</span>
          </div>
          <div>
            Sessions: {sessions.length} | Students: {students.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromptEditor;
