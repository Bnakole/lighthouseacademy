import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// Common emojis for quick access
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
  '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
  '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️',
  '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎁', '🎈'
];

export interface GroupChatProps {
  senderId?: string;
  senderName?: string;
  senderType?: 'student' | 'admin' | 'secretary' | 'sco' | 'leader';
  senderPhoto?: string;
  embedded?: boolean;
}

export function GroupChat({ senderId, senderName, senderType, senderPhoto, embedded = false }: GroupChatProps) {
  const { groupMessages, sendGroupMessage, editGroupMessage, deleteGroupMessage, students, auth } = useApp();
  const [isOpen, setIsOpen] = useState(embedded);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get sender info from props or auth context
  const currentSenderId = senderId || auth.currentStudent?.id || 'admin';
  const currentSenderName = senderName || 
    (auth.currentStudent ? `${auth.currentStudent.firstName} ${auth.currentStudent.lastName}` : 
    auth.userType === 'admin' ? 'Admin' : 
    auth.userType === 'secretary' ? 'Secretary' : 
    auth.userType === 'sco' ? 'Student Coordinator' : 'User');
  const currentSenderType = senderType || auth.userType || 'student';
  const currentSenderPhoto = senderPhoto || auth.currentStudent?.profilePicture;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen || embedded) {
      scrollToBottom();
    }
  }, [groupMessages, isOpen, embedded]);

  const handleSend = () => {
    if (!message.trim()) return;

    sendGroupMessage({
      senderId: currentSenderId,
      senderName: currentSenderName,
      senderType: currentSenderType as 'student' | 'admin' | 'secretary' | 'sco',
      senderPhoto: currentSenderPhoto,
      content: message.trim(),
      type: 'text'
    });

    setMessage('');
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleEdit = (msgId: string, currentContent: string) => {
    setEditingMessageId(msgId);
    setEditText(currentContent);
  };

  const saveEdit = () => {
    if (editingMessageId && editText.trim()) {
      editGroupMessage(editingMessageId, editText.trim());
      setEditingMessageId(null);
      setEditText('');
    }
  };

  const handleDelete = (msgId: string) => {
    if (confirm('Delete this message?')) {
      deleteGroupMessage(msgId);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'document';
      
      sendGroupMessage({
        senderId: currentSenderId,
        senderName: currentSenderName,
        senderType: currentSenderType as 'student' | 'admin' | 'secretary' | 'sco',
        senderPhoto: currentSenderPhoto,
        content: file.name,
        type: fileType,
        fileUrl: reader.result as string,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const getSenderInfo = (msg: typeof groupMessages[0]) => {
    if (msg.senderType === 'student' || msg.senderType === 'leader') {
      const student = students.find(s => s.id === msg.senderId);
      return {
        name: student ? `${student.firstName} ${student.lastName}` : msg.senderName,
        photo: student?.profilePicture || msg.senderPhoto
      };
    }
    return { name: msg.senderName, photo: msg.senderPhoto };
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = groupMessages.length;

  // If embedded, render without floating button
  if (embedded) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {groupMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p className="text-4xl mb-2">💬</p>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            groupMessages.map((msg) => {
              const isOwn = msg.senderId === currentSenderId;
              const senderInfo = getSenderInfo(msg);
              const isDeleted = msg.deleted;

              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {senderInfo.photo ? (
                        <img src={senderInfo.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {senderInfo.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-500 mb-1">
                        {senderInfo.name}
                        {msg.senderType !== 'student' && msg.senderType !== 'leader' && (
                          <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                            {msg.senderType}
                          </span>
                        )}
                      </span>

                      <div className={`relative group ${
                        isOwn 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                          : 'bg-white text-gray-800 border'
                      } rounded-2xl px-4 py-2 shadow-sm`}>
                        {isDeleted ? (
                          <p className="italic text-gray-400 text-sm">This message was deleted</p>
                        ) : editingMessageId === msg.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="px-2 py-1 border rounded text-black text-sm"
                              autoFocus
                            />
                            <button onClick={saveEdit} className="text-green-500 text-sm">✓</button>
                            <button onClick={() => setEditingMessageId(null)} className="text-red-500 text-sm">✕</button>
                          </div>
                        ) : (
                          <>
                            {msg.type === 'image' && msg.fileUrl && (
                              <img src={msg.fileUrl} alt="" className="max-w-[200px] rounded-lg mb-1" />
                            )}
                            {msg.type === 'video' && msg.fileUrl && (
                              <video src={msg.fileUrl} controls className="max-w-[200px] rounded-lg mb-1" />
                            )}
                            {msg.type === 'document' && (
                              <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-2 text-sm underline">
                                📎 {msg.fileName}
                              </a>
                            )}
                            {(msg.type === 'text' || !msg.type) && (
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            )}

                            {/* Edit indicator */}
                            {msg.editedAt && (
                              <span className="text-[10px] opacity-60">(edited)</span>
                            )}

                            {/* Actions for own messages */}
                            {isOwn && !isDeleted && (
                              <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white rounded-lg shadow-lg p-1">
                                <button 
                                  onClick={() => handleEdit(msg.id, msg.content)}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDelete(msg.id)}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <span className="text-[10px] text-gray-400 mt-1">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="bg-white border-t p-3 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_LIST.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => addEmoji(emoji)}
                  className="text-xl p-1 hover:bg-gray-100 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-white border-t">
          <div className="flex items-center gap-2">
            {/* Emoji Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              😊
            </button>

            {/* File Upload */}
            <label className="p-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white w-full h-full sm:h-[600px] sm:max-w-2xl sm:rounded-xl shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between sm:rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <h3 className="font-bold">General Group Chat</h3>
                  <p className="text-xs text-white/80">{students.length} members</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {groupMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p className="text-4xl mb-2">💬</p>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                groupMessages.map((msg) => {
                  const isOwn = msg.senderId === currentSenderId;
                  const senderInfo = getSenderInfo(msg);
                  const isDeleted = msg.deleted;

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {senderInfo.photo ? (
                            <img src={senderInfo.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {senderInfo.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <span className="text-xs text-gray-500 mb-1">
                            {senderInfo.name}
                            {msg.senderType !== 'student' && msg.senderType !== 'leader' && (
                              <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                {msg.senderType}
                              </span>
                            )}
                          </span>

                          <div className={`relative group ${
                            isOwn 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                              : 'bg-white text-gray-800 border'
                          } rounded-2xl px-4 py-2 shadow-sm`}>
                            {isDeleted ? (
                              <p className="italic text-gray-400 text-sm">This message was deleted</p>
                            ) : editingMessageId === msg.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="px-2 py-1 border rounded text-black text-sm"
                                  autoFocus
                                />
                                <button onClick={saveEdit} className="text-green-500 text-sm">✓</button>
                                <button onClick={() => setEditingMessageId(null)} className="text-red-500 text-sm">✕</button>
                              </div>
                            ) : (
                              <>
                                {msg.type === 'image' && msg.fileUrl && (
                                  <img src={msg.fileUrl} alt="" className="max-w-[200px] rounded-lg mb-1" />
                                )}
                                {msg.type === 'video' && msg.fileUrl && (
                                  <video src={msg.fileUrl} controls className="max-w-[200px] rounded-lg mb-1" />
                                )}
                                {msg.type === 'document' && (
                                  <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-2 text-sm underline">
                                    📎 {msg.fileName}
                                  </a>
                                )}
                                {(msg.type === 'text' || !msg.type) && (
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                )}

                                {/* Edit indicator */}
                                {msg.editedAt && (
                                  <span className="text-[10px] opacity-60">(edited)</span>
                                )}

                                {/* Actions for own messages */}
                                {isOwn && !isDeleted && (
                                  <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white rounded-lg shadow-lg p-1">
                                    <button 
                                      onClick={() => handleEdit(msg.id, msg.content)}
                                      className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(msg.id)}
                                      className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <span className="text-[10px] text-gray-400 mt-1">{formatTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-xl border p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => addEmoji(emoji)}
                      className="text-xl p-1 hover:bg-gray-100 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white border-t">
              <div className="flex items-center gap-2">
                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  😊
                </button>

                {/* File Upload */}
                <label className="p-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                </label>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GroupChat;
