import React, { useState } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

const AIQueryBar = ({ onQuery, loading = false }) => {
  const [query, setQuery] = useState('')
  const [conversation, setConversation] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    const userMessage = { type: 'user', content: query, timestamp: new Date() }
    setConversation(prev => [...prev, userMessage])
    
    if (onQuery) {
      const response = await onQuery(query)
      const botMessage = { type: 'bot', content: response, timestamp: new Date() }
      setConversation(prev => [...prev, botMessage])
    }
    
    setQuery('')
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Conversation Display */}
      {conversation.length > 0 && (
        <div className="mb-6 space-y-4 max-h-96 overflow-y-auto bg-dark-800 rounded-xl p-4 border border-navy-700">
          {conversation.map((message, index) => (
            <div key={index} className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-primary-600' : 'bg-navy-600'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
                  message.type === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-navy-700 text-navy-100'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-navy-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-2 rounded-lg bg-navy-700">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-navy-300">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-effect rounded-xl border border-navy-700 focus-within:border-primary-500 transition-all duration-200">
          <div className="flex items-center p-4">
            <Bot className="h-5 w-5 text-primary-500 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about Kenyan law, constitution, acts, criminal justice..."
              className="flex-1 bg-transparent text-white placeholder-navy-400 focus:outline-none text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="ml-3 p-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-navy-700 disabled:cursor-not-allowed transition-colors duration-200 ai-glow"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Queries */}
      {conversation.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[
            "What are my constitutional rights?",
            "Criminal procedure in Kenya",
            "How to file a court petition?",
            "Employment law in Kenya"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setQuery(suggestion)}
              className="px-3 py-1 text-xs bg-navy-800 hover:bg-navy-700 rounded-full text-navy-300 hover:text-white transition-colors duration-200 border border-navy-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AIQueryBar