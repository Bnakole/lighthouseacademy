import React, { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  apiKey: string;
  studentName: string;
  studentProgram: string;
  studentSession: string;
}

const AIChat: React.FC<AIChatProps> = ({ apiKey, studentName, studentProgram, studentSession }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        role: 'assistant',
        content: `Hello ${studentName}! 👋 I'm your AI learning assistant for Light House Academy. I'm here to help you with your ${studentProgram} program in the ${studentSession} session.\n\nYou can ask me questions about:\n• Your course materials\n• Study tips and strategies\n• Assignment help\n• General academic guidance\n\nHow can I help you today?`
      }
    ]);
  }, [studentName, studentProgram, studentSession]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setError('AI service is not configured. Please contact the administrator.');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const client = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const systemPrompt = `You are an AI learning assistant for Light House Academy, a Christian-based educational institution. You are helping a student named ${studentName} who is enrolled in the ${studentProgram} program for the ${studentSession} session.

Your role is to:
1. Provide helpful, accurate, and encouraging academic support
2. Help with course materials, study strategies, and general questions
3. Be friendly, patient, and supportive
4. Incorporate Christian values and encouragement when appropriate
5. Encourage the student to reach out to their instructors or SCO (Student Coordinator) for specific course-related issues

Keep responses concise but helpful. Use emojis occasionally to be friendly. If you don't know something specific about the course content, acknowledge it and suggest they check their course materials or contact their instructor.`;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.concat(userMessage).map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content[0].type === 'text' ? response.content[0].text : 'I apologize, I could not generate a response.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI Error:', err);
      setError(err.message || 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold">LHA AI Assistant</h3>
            <p className="text-xs text-purple-200">Powered by Claude AI</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: '400px' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 shadow-md rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow-md rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={1}
            disabled={isLoading || !apiKey}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || !apiKey}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '...' : '📤'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIChat;
