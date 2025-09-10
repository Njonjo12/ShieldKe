import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Scale, Book, Gavel, FileText, Search, ChevronRight, Shield } from 'lucide-react'
import AIQueryBar from '../components/AIQueryBar'

const HomePage = () => {
  const [loading, setLoading] = useState(false)

  const handleQuery = async (query) => {
    setLoading(true)
    try {
      // Simulate API call to backend for legal query processing
      const response = await fetch(`https://d430ac59-680f-47ca-9514-bda141f87f02-00-369cw9xy6j6z2.spock.replit.dev:3001/api/legal/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.answer || "I'll help you find information about that legal topic. Please check our specific sections for detailed information."
      } else {
        return "I'm here to help with Kenyan legal questions. Please try asking about constitutional rights, criminal law, or court procedures."
      }
    } catch (error) {
      return "I'm ready to assist with your legal questions. Please try asking about Kenyan law, constitutional articles, or legal procedures."
    } finally {
      setLoading(false)
    }
  }

  const legalCategories = [
    {
      title: 'Kenyan Constitution',
      description: 'Explore constitutional articles, bill of rights, and fundamental freedoms',
      icon: Book,
      path: '/constitution',
      color: 'from-blue-600 to-blue-800'
    },
    {
      title: 'Acts of Parliament',
      description: 'Browse through parliamentary acts and legislative documents',
      icon: FileText,
      path: '/parliament-acts',
      color: 'from-green-600 to-green-800'
    },
    {
      title: 'Criminal Justice',
      description: 'Criminal law, procedures, and justice system information',
      icon: Gavel,
      path: '/criminal-justice',
      color: 'from-red-600 to-red-800'
    },
    {
      title: 'Court Orders & Directives',
      description: 'Court decisions, judicial directives, and legal precedents',
      icon: Scale,
      path: '/court-orders',
      color: 'from-purple-600 to-purple-800'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-16 w-16 text-primary-500 mr-4" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-navy-300 to-primary-500 bg-clip-text text-transparent">
            ShieldKe
          </h1>
        </div>
        <p className="text-xl text-navy-300 mb-8 max-w-3xl mx-auto">
          Your comprehensive AI-powered guide to Kenyan law, constitutional rights, and legal procedures. 
          Get instant answers to your legal questions.
        </p>
        
        {/* AI Query Interface */}
        <AIQueryBar onQuery={handleQuery} loading={loading} />
      </div>

      {/* Legal Categories Grid */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-navy-200 to-primary-400 bg-clip-text text-transparent">
          Explore Legal Categories
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {legalCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <Link
                key={index}
                to={category.path}
                className="group glass-effect rounded-xl p-6 hover:scale-105 transition-all duration-300 border border-navy-700 hover:border-primary-500"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
                <p className="text-navy-400 text-sm mb-4">{category.description}</p>
                <div className="flex items-center text-primary-400 text-sm font-medium group-hover:text-primary-300">
                  Explore <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="py-16 border-t border-navy-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Quick Legal Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-lg p-6 border border-navy-700">
              <Scale className="h-8 w-8 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Know Your Rights</h3>
              <p className="text-navy-400 text-sm">Understand your fundamental rights under the Kenyan Constitution</p>
            </div>
            <div className="glass-effect rounded-lg p-6 border border-navy-700">
              <Gavel className="h-8 w-8 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Legal Procedures</h3>
              <p className="text-navy-400 text-sm">Step-by-step guides for common legal procedures and processes</p>
            </div>
            <div className="glass-effect rounded-lg p-6 border border-navy-700">
              <Search className="h-8 w-8 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Ask Legal Questions</h3>
              <p className="text-navy-400 text-sm">Get AI-powered answers to your specific legal questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage