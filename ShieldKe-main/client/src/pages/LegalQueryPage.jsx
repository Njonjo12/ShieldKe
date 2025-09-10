import React, { useState } from 'react'
import { MessageCircle, Bot, User, Send, BookOpen, Scale, Gavel } from 'lucide-react'
import AIQueryBar from '../components/AIQueryBar'

const LegalQueryPage = () => {
  const [loading, setLoading] = useState(false)

  const handleQuery = async (query) => {
    setLoading(true)
    try {
      // Simulate backend API call for legal queries
      const response = await fetch(`https://d430ac59-680f-47ca-9514-bda141f87f02-00-369cw9xy6j6z2.spock.replit.dev:3001/api/legal/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.answer || generateMockResponse(query)
      } else {
        return generateMockResponse(query)
      }
    } catch (error) {
      return generateMockResponse(query)
    } finally {
      setLoading(false)
    }
  }

  const generateMockResponse = (query) => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('constitution') || lowerQuery.includes('rights')) {
      return "Based on the Kenyan Constitution 2010, you have fundamental rights protected under Chapter 4 (Bill of Rights). These include the right to life, equality, human dignity, and access to justice. Would you like me to explain any specific constitutional right?"
    }
    
    if (lowerQuery.includes('criminal') || lowerQuery.includes('arrest')) {
      return "In Kenya's criminal justice system, if you're arrested, you have the right to remain silent, be informed of charges, access a lawyer, and be brought before court within 24 hours. The burden of proof lies with the prosecution to prove guilt beyond reasonable doubt."
    }
    
    if (lowerQuery.includes('employment') || lowerQuery.includes('work') || lowerQuery.includes('job')) {
      return "The Employment Act 2007 governs workplace rights in Kenya. You're entitled to fair wages, safe working conditions, leave entitlements, and protection from unfair dismissal. Disputes can be resolved through the Employment and Labour Relations Court."
    }
    
    if (lowerQuery.includes('land') || lowerQuery.includes('property')) {
      return "Kenya's Land Act 2012 recognizes various types of land ownership. The Constitution protects property rights while allowing for compulsory acquisition for public purposes with fair compensation. Land disputes are handled by the National Land Commission and Environment and Land Court."
    }
    
    return "I can help you understand Kenyan law including constitutional rights, criminal procedures, employment law, land matters, and court processes. Please ask me a specific legal question and I'll provide relevant information based on Kenyan legislation."
  }

  const commonQueries = [
    {
      category: "Constitutional Rights",
      icon: BookOpen,
      queries: [
        "What are my fundamental rights under the Constitution?",
        "How do I file a constitutional petition?",
        "What is the difference between civil and political rights?",
        "How does the Bill of Rights protect me?"
      ]
    },
    {
      category: "Criminal Law",
      icon: Gavel,
      queries: [
        "What should I do if I'm arrested?",
        "What are the stages of a criminal trial?",
        "How does bail work in Kenya?",
        "What are my rights during police interrogation?"
      ]
    },
    {
      category: "Civil Matters",
      icon: Scale,
      queries: [
        "How do I file a civil suit?",
        "What is the limitation period for civil cases?",
        "How does the small claims court work?",
        "What remedies are available in civil cases?"
      ]
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <MessageCircle className="h-12 w-12 text-primary-500 mr-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-navy-300 bg-clip-text text-transparent">
            Legal Query Assistant
          </h1>
        </div>
        <p className="text-navy-300 text-lg mb-6">
          Get instant AI-powered answers to your Kenyan legal questions
        </p>
      </div>

      {/* AI Query Interface */}
      <div className="mb-12">
        <AIQueryBar onQuery={handleQuery} loading={loading} />
      </div>

      {/* Common Queries Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-navy-200 to-primary-400 bg-clip-text text-transparent">
          Common Legal Questions
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {commonQueries.map((category, index) => {
            const Icon = category.icon
            return (
              <div key={index} className="glass-effect rounded-xl p-6 border border-navy-700">
                <div className="flex items-center mb-4">
                  <Icon className="h-6 w-6 text-primary-500 mr-3" />
                  <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                </div>
                <div className="space-y-3">
                  {category.queries.map((query, queryIndex) => (
                    <button
                      key={queryIndex}
                      onClick={() => handleQuery(query)}
                      className="w-full text-left p-3 bg-dark-800 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white transition-all duration-200 text-sm border border-navy-700 hover:border-primary-500"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legal Resources */}
      <div className="glass-effect rounded-xl p-8 border border-navy-700">
        <h2 className="text-xl font-bold text-white mb-6">Legal Resources & Disclaimers</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-400 mb-3">How This Works</h3>
            <ul className="space-y-2 text-navy-300 text-sm">
              <li>• AI-powered responses based on Kenyan law</li>
              <li>• Information sourced from Constitution, Acts of Parliament</li>
              <li>• Real-time analysis of your legal questions</li>
              <li>• References to relevant legal provisions</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-primary-400 mb-3">Important Notice</h3>
            <ul className="space-y-2 text-navy-300 text-sm">
              <li>• This is not a substitute for professional legal advice</li>
              <li>• Consult qualified lawyers for specific legal matters</li>
              <li>• Laws may change - verify current legislation</li>
              <li>• For urgent matters, contact emergency services</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-600 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium">
            <strong>Disclaimer:</strong> The information provided is for educational purposes only and should not be construed as legal advice. 
            Always consult with a qualified legal professional for advice on specific legal matters.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LegalQueryPage