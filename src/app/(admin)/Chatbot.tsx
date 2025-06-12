'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import { useChatStore } from '../../store/chatStore'

const ChatWidget = () => {
  const { sessionID } = useChatStore()
  const [messages, setMessages] = useState<{ content: string; from: 'user' | 'bot' }[]>([
    { content: '👋 Hi! What would you like to do?', from: 'bot' },
  ])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input
    setMessages(prev => [...prev, { content: userMessage, from: 'user' }])
    setInput('')
    setIsLoading(true)

    try {
      const { data } = await axios.post(
        'https://n8n.manapnl.com/webhook/72897415-faa9-4227-932a-292052948481',
        { sessionID, userMessage },
        {
          headers: {
            Authorization: 'SMA8LwzAXiqdFhlb0wHT',
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      )

      setMessages(prev => [...prev, { content: data.response || '❌ No response received.', from: 'bot' }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { content: '❌ Failed to reach assistant. Please try again.', from: 'bot' }])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Debug log to check if component is rendering
  useEffect(() => {
    console.log('ChatWidget mounted, sessionID:', sessionID)
  }, [sessionID])

  return (
    <>
      {/* Chat Window */}
      <div
        className={clsx(
          'fixed bottom-20 right-6 z-[9999] w-80 max-w-[calc(100vw-3rem)] transition-all duration-300 ease-in-out',
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        )}
        style={{ height: isOpen ? '500px' : '0px' }}
      >
        <div className="flex flex-col h-full bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-700 text-white px-4 py-3 text-sm font-semibold flex justify-between items-center">
            <span>💬 Osen Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300 transition-colors w-6 h-6 flex items-center justify-center rounded"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  'px-4 py-2 rounded-xl w-fit max-w-[80%] break-words',
                  msg.from === 'bot'
                    ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    : 'bg-blue-600 text-white ml-auto'
                )}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="px-4 py-2 rounded-xl w-fit max-w-[80%] bg-white text-gray-800 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button - Force visibility with important styles */}
      <button
        className="fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-800 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          zIndex: 99999,
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: isOpen ? '#4B5563' : '#1D4ED8',
          display: 'flex !important',
          visibility: 'visible !important',
          opacity: '1 !important'
        }}
        onClick={() => {
          console.log('Chat button clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  )
}

export default ChatWidget