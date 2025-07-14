'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'
import './ChatWidget.css'

const ChatWidget = () => {
  const { sessionID } = useChatStore()
  const [messages, setMessages] = useState<{ content: string; from: 'user' | 'bot'; timestamp?: Date; id: string }[]>([
    { content: '👋 Hi! What would you like to do?', from: 'bot', timestamp: new Date(), id: '1' },
  ])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [showCommands, setShowCommands] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const user = useAuthStore((state) => state.user)

  const commandCategories = [
    {
      title: "📦 Inventory Management",
      icon: "📦",
      color: "blue",
      commands: [
        { text: "Show all inventory", message: "Show me all inventory items" },
        { text: "Add new product", message: "Add new inventory item" },
        { text: "Check stock levels", message: "Check current stock levels" },
        { text: "Update inventory", message: "Update existing inventory" }
      ]
    },
    {
      title: "👥 Buyer Management",
      icon: "👥",
      color: "green",
      commands: [
        { text: "Show all buyers", message: "Show me all buyers" },
        { text: "Add new buyer", message: "Add a new buyer" },
        { text: "Check buyer balance", message: "Check buyer balance" },
        { text: "Update buyer info", message: "Update buyer information" }
      ]
    },
    {
      title: "💰 Expense Tracking",
      icon: "💰",
      color: "purple",
      commands: [
        { text: "Show expenses", message: "Show me recent expenses" },
        { text: "Add expense", message: "Add a new expense" },
        { text: "Expense categories", message: "Show expense categories" },
        { text: "Monthly summary", message: "Show monthly expense summary" }
      ]
    }
  ]

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim()
    if (!userMessage || isLoading) return
    
    const newUserMessage = { 
      content: userMessage, 
      from: 'user' as const, 
      timestamp: new Date(),
      id: generateId()
    }
    
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setIsLoading(true)
    setShowCommands(false) // Hide commands after first interaction
  
    try {
      const response = await api.post('/api/bot/chat', {
        sessionID, 
        userMessage, 
        userId: user?._id,
        useRedis: true
      })
      
      const botResponse = { 
        content: response.data?.response, 
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

  const handleCommandClick = (command: { text: string; message: string }) => {
    sendMessage(command.message)
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

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: { bg: 'bg-primary', text: 'text-primary', border: 'border-primary' },
      green: { bg: 'bg-success', text: 'text-success', border: 'border-success' },
      purple: { bg: 'bg-info', text: 'text-info', border: 'border-info' }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <>
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

          {/* Command Categories */}
          {showCommands && (
            <div className="command-categories-container">
              <div className="command-categories-header">
                <h6 className="mb-2 fw-bold text-muted">Quick Actions</h6>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowCommands(false)}
                  style={{ fontSize: '12px', padding: '2px 8px' }}
                >
                  Hide
                </button>
              </div>
              
              <div className="command-categories">
                {commandCategories.map((category, categoryIndex) => {
                  const colors = getColorClasses(category.color)
                  return (
                    <div key={categoryIndex} className="command-category">
                      <div className={`category-header ${colors.bg} bg-opacity-10 ${colors.border} border-start border-3`}>
                        <span className="category-icon">{category.icon}</span>
                        <span className={`category-title ${colors.text} fw-semibold`}>
                          {category.title.replace(/^[^\s]+\s/, '')}
                        </span>
                      </div>
                      <div className="command-buttons">
                        {category.commands.map((command, commandIndex) => (
                          <button
                            key={commandIndex}
                            className={`command-btn btn btn-sm ${colors.border} border-opacity-25`}
                            onClick={() => handleCommandClick(command)}
                            disabled={isLoading}
                          >
                            {command.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="command-categories-footer">
                <small className="text-muted">Click any button to get started</small>
              </div>
            </div>
          )}

          {/* Show Commands Button (when hidden) */}
          {!showCommands && (
            <div className="show-commands-container">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowCommands(true)}
                style={{ fontSize: '12px' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="me-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </button>
            </div>
          )}

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
                />
                {input.length > 400 && (
                  <div className="char-counter">
                    {input.length}/500
                  </div>
                )}
              </div>
              <button
                onClick={() => sendMessage()}
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