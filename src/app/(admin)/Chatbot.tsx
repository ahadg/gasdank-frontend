'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'

const ChatWidget = () => {
  const { sessionID } = useChatStore()
  const [messages, setMessages] = useState<{ content: string; from: 'user' | 'bot'; timestamp?: Date; id: string }[]>([
    { 
      content: '👋 Hi there! I\'m your Osen Assistant. How can I help you today?', 
      from: 'bot', 
      timestamp: new Date(), 
      id: '1' 
    },
    { 
      content: 'Try saying "add product" or "create sale", or click Quick Actions below for shortcuts.', 
      from: 'bot', 
      timestamp: new Date(), 
      id: '2' 
    },
  ])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [showCommands, setShowCommands] = useState(true) // Show by default initially
  const [activeForm, setActiveForm] = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const user = useAuthStore((state) => state.user)

  // Form configurations
  const formConfigs = {
    'add_product': {
      title: 'Add New Product',
      icon: '📦',
      fields: [
        { name: 'productName', label: 'Product Name', type: 'text', required: true },
        { name: 'categoryName', label: 'Category', type: 'text', required: true },
        { name: 'unit', label: 'Units', type: 'select', options: ['pound', 'kg', 'gram'], required: true },
        { name: 'qty', label: 'Quantity', type: 'number', required: true },
        { name: 'price', label: 'Price', type: 'number', required: true },
        { name: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
        { name: 'shippingCost', label: 'Shipping Cost', type: 'number', required: false }
      ],
      submitButton: 'Add Product'
    },
    'add_client': {
      title: 'Add New Client',
      icon: '👥',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
        { name: 'balance', label: 'Outstanding Balance', type: 'number', required: false }
      ],
      submitButton: 'Add Client'
    },
    'create_sale': {
      title: 'Create Sale',
      icon: '💰',
      fields: [
        { name: 'buyerName', label: 'Client Name', type: 'text', required: true },
        { name: 'productName', label: 'Product', type: 'text', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'salePrice', label: 'Sale Price', type: 'number', required: true },
        { name: 'notes', label: 'Notes', type: 'textarea', required: false }
      ],
      submitButton: 'Create Sale'
    },
    'wholesale_order': {
      title: 'Wholesale Order',
      icon: '📊',
      fields: [
        { name: 'buyerName', label: 'Wholesale Client', type: 'text', required: true },
        { name: 'orderItems', label: 'Order Items (one per line)', type: 'textarea', required: true },
        { name: 'totalAmount', label: 'Total Amount', type: 'number', required: true },
        { name: 'deliveryDate', label: 'Delivery Date', type: 'date', required: false }
      ],
      submitButton: 'Place Order'
    }
  }

  // Command detection patterns
  const commandPatterns = [
    { pattern: /add\s+(new\s+)?product|new\s+product|add\s+inventory/i, form: 'add_product' },
    { pattern: /add\s+(new\s+)?client|new\s+client|add\s+buyer/i, form: 'add_client' },
    { pattern: /create\s+sale|new\s+sale|make\s+sale/i, form: 'create_sale' },
    { pattern: /wholesale\s+order|bulk\s+order|wholesale/i, form: 'wholesale_order' }
  ]

  const commandCategories = [
    {
      title: "Inventory",
      icon: "📦",
      color: "blue",
      commands: [
        { text: "Show all inventory", message: "Show me all inventory items" },
        { text: "Add new product", message: "Add new product", form: 'add_product' },
        { text: "Check stock levels", message: "Check current stock levels" },
        { text: "Update inventory", message: "Update existing inventory" }
      ]
    },
    {
      title: "Clients",
      icon: "👥",
      color: "green",
      commands: [
        { text: "Show all buyers", message: "Show me all buyers" },
        { text: "Add new client", message: "Add a new client", form: 'add_client' },
        { text: "Check buyer balance", message: "Check buyer balance" },
        { text: "Update buyer info", message: "Update buyer information" }
      ]
    },
    {
      title: "Sales",
      icon: "💰",
      color: "purple",
      commands: [
        { text: "Create sale", message: "Create a new sale", form: 'create_sale' },
        { text: "Wholesale order", message: "Create wholesale order", form: 'wholesale_order' },
        { text: "Show expenses", message: "Show me recent expenses" },
        { text: "Monthly summary", message: "Show monthly expense summary" }
      ]
    }
  ]

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Detect if message should trigger a form
  const detectFormCommand = (message) => {
    for (const pattern of commandPatterns) {
      if (pattern.pattern.test(message)) {
        return pattern.form
      }
    }
    return null
  }

  const sendMessage = async (messageText?: string, skipFormDetection = false) => {
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
    setShowCommands(false)

    // Check if this should trigger a form
    if (!skipFormDetection) {
      const formType = detectFormCommand(userMessage)
      if (formType && formConfigs[formType]) {
        setActiveForm(formType)
        setFormData({})
        setFormErrors({})
        setIsLoading(false)
        
        const formResponse = {
          content: `I'll help you ${formConfigs[formType].title.toLowerCase()}. Please fill out the form below.`,
          from: 'bot' as const,
          timestamp: new Date(),
          id: generateId()
        }
        setMessages(prev => [...prev, formResponse])
        return
      }
    }
  
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

  const handleCommandClick = (command: { text: string; message: string; form?: string }) => {
    if (command.form) {
      setActiveForm(command.form)
      setFormData({})
      setFormErrors({})
      
      const formMessage = {
        content: command.message,
        from: 'user' as const,
        timestamp: new Date(),
        id: generateId()
      }
      setMessages(prev => [...prev, formMessage])
      
      const formResponse = {
        content: `I'll help you ${formConfigs[command.form].title.toLowerCase()}. Please fill out the form below.`,
        from: 'bot' as const,
        timestamp: new Date(),
        id: generateId()
      }
      setMessages(prev => [...prev, formResponse])
    } else {
      sendMessage(command.message, true)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const config = formConfigs[activeForm]
    const errors = {}
    
    // Validate required fields
    config.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} is required`
      }
    })
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setIsLoading(true)
    
    try {
      // Create a message based on form data
      let message = `${config.title} with the following details:\n`
      config.fields.forEach(field => {
        if (formData[field.name]) {
          message += `${field.label}: ${formData[field.name]}\n`
        }
      })
      
      // Send form data as a regular message
      await sendMessage(message, true)
      
      // Close form
      setActiveForm(null)
      setFormData({})
      setFormErrors({})
      
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: null }))
    }
  }

  const closeForm = () => {
    setActiveForm(null)
    setFormData({})
    setFormErrors({})
  }

  const renderFormField = (field) => {
    const hasError = formErrors[field.name]
    
    const baseClasses = `block w-full rounded-lg py-2.5 px-3.5 border bg-gray-50 focus:bg-white transition-all duration-200 ${
      hasError 
        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
        : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
    }`
    
    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className={`mb-4 ${hasError ? 'text-red-500' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              className={baseClasses}
            >
              <option value="">Select {field.label}</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {hasError && <p className="mt-1.5 text-sm text-red-600">{hasError}</p>}
          </div>
        )
      
      case 'textarea':
        return (
          <div key={field.name} className={`mb-4 ${hasError ? 'text-red-500' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              className={`${baseClasses} min-h-[100px]`}
              rows={3}
            />
            {hasError && <p className="mt-1.5 text-sm text-red-600">{hasError}</p>}
          </div>
        )
      
      default:
        return (
          <div key={field.name} className={`mb-4 ${hasError ? 'text-red-500' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              className={baseClasses}
              step={field.type === 'number' ? '0.01' : undefined}
            />
            {hasError && <p className="mt-1.5 text-sm text-red-600">{hasError}</p>}
          </div>
        )
    }
  }

  const toggleChat = () => {
    setIsOpen(prev => {
      const newState = !prev
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Close command menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        setShowCommands(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-600', 
        border: 'border-blue-200',
        button: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
      },
      green: { 
        bg: 'bg-green-50', 
        text: 'text-green-600', 
        border: 'border-green-200',
        button: 'bg-green-100 hover:bg-green-200 text-green-700'
      },
      purple: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-600', 
        border: 'border-purple-200',
        button: 'bg-purple-100 hover:bg-purple-200 text-purple-700'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-[999999] w-16 h-16 rounded-full shadow-xl transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isOpen 
            ? 'bg-gray-600 focus:ring-gray-400' 
            : hasNewMessage 
              ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse focus:ring-red-400' 
              : 'bg-gradient-to-br from-blue-600 to-indigo-600 focus:ring-blue-400'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {hasNewMessage && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
              )}
            </>
          )}
        </div>
      </button>

      {/* Smart Form Modal */}
      {activeForm && (
        <div className="fixed inset-0 z-[999999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{formConfigs[activeForm].icon}</span>
                <h3 className="text-xl font-semibold text-gray-900">{formConfigs[activeForm].title}</h3>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                onClick={closeForm}
                aria-label="Close form"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-5 max-h-[calc(90vh-140px)] overflow-y-auto">
              {formConfigs[activeForm].fields.map(renderFormField)}
              
              <div className="flex justify-end gap-3 mt-6 pt-5 border-t">
                <button 
                  type="button" 
                  onClick={closeForm} 
                  className="px-5 py-2.5 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    formConfigs[activeForm].submitButton
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className="fixed bottom-[100px] right-6 z-[999998] w-96 max-w-[calc(100vw-48px)] h-[680px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col animate-slide-up"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    🤖
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="font-bold text-lg">Osen Assistant</h2>
                  <p className="text-xs opacity-80">Always here to help</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Command Categories */}
          {showCommands && (
            <div className="bg-gray-50 border-b p-4 max-h-64 overflow-y-auto flex-shrink-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700">Quick Actions</h3>
                <button
                  className="text-xs py-1 px-2.5 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                  onClick={() => setShowCommands(false)}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  Hide
                </button>
              </div>
              
              <div className="space-y-3">
                {commandCategories.map((category, categoryIndex) => {
                  const colors = getColorClasses(category.color)
                  return (
                    <div key={categoryIndex} className={`rounded-lg overflow-hidden border ${colors.border}`}>
                      <div className={`flex items-center px-3 py-2.5 gap-2 ${colors.bg}`}>
                        <span className="text-lg">{category.icon}</span>
                        <span className={`${colors.text} font-semibold`}>
                          {category.title}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-2 bg-white">
                        {category.commands.map((command, commandIndex) => (
                          <button
                            key={commandIndex}
                            className={`text-xs py-2 px-2.5 rounded-md border hover:shadow transition-all ${colors.button} ${
                              command.form ? 'relative pl-7' : ''
                            }`}
                            onClick={() => handleCommandClick(command)}
                            disabled={isLoading}
                          >
                            {command.form && (
                              <span className="absolute left-2 top-2 text-xs">📝</span>
                            )}
                            {command.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-3 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                <span>📝 = Opens form</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>Click any button to start</span>
              </div>
            </div>
          )}

          {/* Show Commands Button (when hidden) */}
          {!showCommands && (
            <div className="p-2 bg-gray-50 border-b text-center flex-shrink-0">
              <button
                className="text-xs py-1.5 px-3 border border-blue-500 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 mx-auto"
                onClick={() => setShowCommands(true)}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                </svg>
                Quick Actions
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-2 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 max-w-[90%] ${
                  msg.from === 'bot' ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                  msg.from === 'bot' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                }`}>
                  {msg.from === 'bot' ? '🤖' : '👤'}
                </div>
                <div className={`p-3 rounded-xl shadow-sm ${
                  msg.from === 'bot' 
                    ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className={`text-xs mt-1.5 ${
                    msg.from === 'bot' ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 max-w-[90%] mr-auto">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  🤖
                </div>
                <div className="p-3 rounded-xl shadow-sm bg-white border border-gray-200 rounded-bl-none flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2 border-t bg-white flex-shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-grow relative">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl py-2 px-4 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-12"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  maxLength={500}
                />
                {input.length > 0 && (
                  <button
                    onClick={() => setInput('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear input"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {input.length > 0 && (
                  <div className="absolute -top-6 right-2 text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                    {input.length}/500
                  </div>
                )}
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className={`w-12 h-12 flex items-center justify-center rounded-xl text-white shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isLoading || !input.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Try: "add product", "new client", or "create sale"
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget