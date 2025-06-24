'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '@/store/authStore'
//import 'bootstrap/dist/css/bootstrap.min.css'

const ChatWidget = () => {
  const { sessionID } = useChatStore()
  const [messages, setMessages] = useState<{ content: string; from: 'user' | 'bot'; timestamp?: Date; id: string }[]>([
    { content: '👋 Hi! What would you like to do?', from: 'bot', timestamp: new Date(), id: '1' },
  ])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const user = useAuthStore((state) => state.user)

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    const newUserMessage = { 
      content: userMessage, 
      from: 'user' as const, 
      timestamp: new Date(),
      id: generateId()
    }
    
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setIsLoading(true)
  
    try {
      // Use your backend proxy instead of direct N8N call
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.manapnl.com'}/api/webhook-proxy/n8n-chat`,
        { 
          sessionID, 
          userMessage, 
          userId: user?._id 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Add any authentication headers your backend requires
          },
          timeout: 15000,
        }
      )
      
      console.log("dataaa", data)
      
      // If data is a string, parse it
      const match = data.match ? data.match(/"response"\s*:\s*"([^"]+)"/) : null
      const responseText = match ? match[1] : (data.response || data.message || '❌ No response found.')
      
      const botResponse = { 
        content: responseText, 
        from: 'bot' as const, 
        timestamp: new Date(),
        id: generateId()
      }
    
      setMessages(prev => [...prev, botResponse])
    
      if (!isOpen) {
        setHasNewMessage(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = { 
        content: '❌ Sorry, I encountered an error. Please try again.', 
        from: 'bot' as const, 
        timestamp: new Date(),
        id: generateId()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleChat = () => {
    console.log('Toggle chat clicked, current state:', isOpen)
    setIsOpen(prev => {
      const newState = !prev
      console.log('New chat state:', newState)
      if (newState) {
        setHasNewMessage(false)
        setTimeout(() => inputRef.current?.focus(), 300)
      }
      return newState
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    console.log('ChatWidget mounted, sessionID:', sessionID)
  }, [sessionID])

  return (
    <>
      <style jsx>{`
        .chat-toggle-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .chat-toggle-btn:hover {
          transform: scale(1.1);
        }
        
        .chat-toggle-btn:active {
          transform: scale(0.95);
        }
        
        .chat-toggle-btn.open {
          background: linear-gradient(135deg, #6b7280, #374151);
        }
        
        .chat-toggle-btn.new-message {
          background: linear-gradient(135deg, #ef4444, #ec4899);
          animation: bounce 1s infinite;
        }
        
        .chat-toggle-btn.default {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }
        
        .notification-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        .chat-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          z-index: 999998;
          width: 380px;
          max-width: calc(100vw - 48px);
          height: 580px;
          max-height: calc(100vh - 140px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border-radius: 24px;
          overflow: hidden;
          animation: slideInUp 0.3s ease-out;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .chat-header {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: white;
          padding: 1rem 1.5rem;
        }
        
        .status-indicator {
          width: 12px;
          height: 12px;
          background-color: #10b981;
          border-radius: 50%;
          animation: pulse-green 2s infinite;
        }
        
        @keyframes pulse-green {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        
        .messages-container {
          background: linear-gradient(to bottom, #f9fafb, white);
          height: calc(100% - 140px);
          overflow-y: auto;
          padding: 1rem;
        }
        
        .message-bubble {
          max-width: 85%;
          margin-bottom: 1rem;
        }
        
        .message-bubble.bot {
          margin-right: auto;
        }
        
        .message-bubble.user {
          margin-left: auto;
        }
        
        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        
        .message-content.bot {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 0.25rem;
        }
        
        .message-content.user {
          background: linear-gradient(135deg, #3b82f6, #4f46e5);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }
        
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 0.5rem;
        }
        
        .avatar-bot {
          background: linear-gradient(135deg, #3b82f6, #4f46e5);
          color: white;
        }
        
        .avatar-user {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        
        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.25rem;
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          border-bottom-left-radius: 0.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }
        
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #60a5fa;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        .chat-input-container {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: white;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .char-counter {
          position: absolute;
          top: -28px;
          right: 8px;
          font-size: 0.75rem;
          color: #6b7280;
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }
        
        .send-btn {
          background: linear-gradient(135deg, #3b82f6, #4f46e5);
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 0.75rem;
          min-width: 48px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #4338ca);
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        
        .send-btn:disabled {
          background: linear-gradient(135deg, #d1d5db, #9ca3af);
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`chat-toggle-btn d-flex align-items-center justify-content-center ${
          isOpen 
            ? 'open' 
            : hasNewMessage 
              ? 'new-message' 
              : 'default'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className="position-relative">
          {isOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {hasNewMessage && <div className="notification-dot"></div>}
            </>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window bg-white">
          {/* Header */}
          <div className="chat-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="status-indicator me-3"></div>
                <div>
                  <h6 className="mb-0 fw-bold">Osen Assistant</h6>
                  <small className="opacity-75">Always here to help</small>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="btn btn-link text-white p-0"
                style={{ opacity: 0.7 }}
                aria-label="Close chat"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-bubble ${msg.from}`}>
                <div className={`message-avatar ${msg.from === 'bot' ? 'avatar-bot' : 'avatar-user'}`}>
                  {msg.from === 'bot' ? '🤖' : '👤'}
                </div>
                <div className={`message-content ${msg.from}`}>
                  <div>{msg.content}</div>
                  <div className="message-time">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="message-bubble bot">
                <div className="message-avatar avatar-bot">🤖</div>
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span className="text-muted small">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <div className="d-flex gap-2 align-items-end">
              <div className="flex-grow-1 input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control"
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  maxLength={500}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {input.length > 400 && (
                  <div className="char-counter">
                    {input.length}/500
                  </div>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="send-btn d-flex align-items-center justify-content-center"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget