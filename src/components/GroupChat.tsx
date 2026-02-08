import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface GroupChatProps {
  oderId?: string;
  oderId?: string;
  userName: string;
  userType: 'student' | 'admin' | 'secretary' | 'sco' | 'leader';
  userPhoto?: string;
  currentUserType?: string;
}

const GroupChat: React.FC<GroupChatProps> = (props) => {
  const oderId = props.oderId || props.oderId || '';
  const { userName, userType, userPhoto } = props;
  
  const { groupMessages, sendGroupMessage, editGroupMessage, deleteGroupMessage, students } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [groupMessages, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const senderType = userType === 'leader' ? 'student' : userType;
    
    sendGroupMessage({
      senderId: oderId,
      senderName: userName,
      senderType: senderType as 'student' | 'admin' | 'secretary' | 'sco',
      senderPhoto: userPhoto,
      content: message.trim(),
      type: 'text'
    });
    
    setMessage('');
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditText(content);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      editGroupMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this message?')) {
      deleteGroupMessage(id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      const senderType = userType === 'leader' ? 'student' : userType;
      
      sendGroupMessage({
        senderId: oderId,
        senderName: userName,
        senderType: senderType as 'student' | 'admin' | 'secretary' | 'sco',
        senderPhoto: userPhoto,
        content: file.name,
        type: fileType,
        fileUrl: reader.result as string,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages: { [date: string]: typeof groupMessages } = {};
  groupMessages.forEach(msg => {
    const date = formatDate(msg.timestamp);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50 flex items-center gap-2"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline text-sm font-medium">Group Chat</span>
        {groupMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {groupMessages.length > 99 ? '99+' : groupMessages.length}
          </span>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white w-full h-full sm:h-[80vh] sm:max-h-[600px] sm:max-w-lg sm:rounded-xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  🏠
                </div>
                <div>
                  <h3 className="font-semibold">Light House Academy</h3>
                  <p className="text-xs text-blue-100">{students.length} members</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-2xl hover:bg-white/10 p-1 rounded">
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="text-center mb-4">
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {date}
                    </span>
                  </div>
                  
                  {msgs.map((msg) => {
                    const isOwn = msg.senderId === oderId;
                    const isDeleted = msg.deleted;
                    
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                          {!isOwn && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs overflow-hidden">
                                {msg.senderPhoto ? (
                                  <img src={msg.senderPhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  msg.senderName[0]
                                )}
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                {msg.senderName}
                                {msg.senderType !== 'student' && (
                                  <span className="ml-1 text-blue-600">({msg.senderType})</span>
                                )}
                              </span>
                            </div>
                          )}
                          
                          <div className={`rounded-lg p-3 ${
                            isOwn 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white text-gray-800 border'
                          } ${isDeleted ? 'italic opacity-60' : ''}`}>
                            {editingId === msg.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="flex-1 px-2 py-1 rounded text-black text-sm"
                                  autoFocus
                                />
                                <button onClick={saveEdit} className="text-green-400">✓</button>
                                <button onClick={() => setEditingId(null)} className="text-red-400">×</button>
                              </div>
                            ) : (
                              <>
                                {msg.type === 'image' && msg.fileUrl && (
                                  <img src={msg.fileUrl} alt="" className="max-w-full rounded mb-2" />
                                )}
                                {msg.type === 'file' && msg.fileUrl && (
                                  <a 
                                    href={msg.fileUrl} 
                                    download={msg.fileName}
                                    className={`flex items-center gap-2 ${isOwn ? 'text-blue-100' : 'text-blue-600'} underline`}
                                  >
                                    📎 {msg.fileName || 'Download file'}
                                  </a>
                                )}
                                {(msg.type === 'text' || !msg.type) && (
                                  <p className="text-sm">{msg.content}</p>
                                )}
                              </>
                            )}
                            
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                {formatTime(msg.timestamp)}
                                {msg.editedAt && ' (edited)'}
                              </span>
                              
                              {isOwn && !isDeleted && editingId !== msg.id && (
                                <div className="flex gap-2 ml-2">
                                  <button 
                                    onClick={() => handleEdit(msg.id, msg.content)}
                                    className={`text-xs ${isOwn ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(msg.id)}
                                    className={`text-xs ${isOwn ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {groupMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-4xl mb-2">👋</p>
                  <p>Welcome to the group chat!</p>
                  <p className="text-sm">Start a conversation</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span>📎</span>
                </label>
                
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-blue-500"
                />
                
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChat;
