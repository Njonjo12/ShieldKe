import React, { useState } from 'react'
import { FileText, Search, Calendar, Tag } from 'lucide-react'

const ParliamentActsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const parliamentActs = [
    {
      title: 'Employment Act',
      year: '2007',
      category: 'Labour Law',
      description: 'An Act of Parliament to declare and define the fundamental rights of employees, to provide basic conditions of employment and for connected purposes.',
      status: 'Active'
    },
    {
      title: 'Land Act',
      year: '2012', 
      category: 'Property Law',
      description: 'An Act to give effect to Article 68 of the Constitution and to revise, consolidate and rationalize land laws.',
      status: 'Active'
    },
    {
      title: 'Public Finance Management Act',
      year: '2012',
      category: 'Public Finance',
      description: 'An Act to provide for the effective management of public finances by the national and county governments.',
      status: 'Active'
    },
    {
      title: 'Penal Code',
      year: '2012',
      category: 'Criminal Law',
      description: 'An Act to establish a code of criminal law, to revise, consolidate and reform the law relating to crimes.',
      status: 'Active'
    },
    {
      title: 'Criminal Procedure Code',
      year: '2012',
      category: 'Criminal Law', 
      description: 'An Act to establish procedures for the conduct of criminal proceedings in subordinate courts.',
      status: 'Active'
    },
    {
      title: 'Evidence Act',
      year: '2011',
      category: 'Procedural Law',
      description: 'An Act to declare the law of evidence in civil and criminal proceedings.',
      status: 'Active'
    },
    {
      title: 'Civil Procedure Act',
      year: '2012',
      category: 'Procedural Law',
      description: 'An Act to declare the law relating to the procedure of courts in civil proceedings.',
      status: 'Active'
    },
    {
      title: 'Companies Act',
      year: '2015',
      category: 'Corporate Law',
      description: 'An Act to consolidate and amend the law relating to companies and for connected purposes.',
      status: 'Active'
    },
    {
      title: 'Competition Act',
      year: '2010',
      category: 'Commercial Law',
      description: 'An Act to promote and safeguard competition in the national economy and to protect consumers from unfair market conduct.',
      status: 'Active'
    },
    {
      title: 'Environmental Management and Co-ordination Act',
      year: '1999',
      category: 'Environmental Law',
      description: 'An Act to provide for the establishment of an appropriate legal and institutional framework for the management of the environment.',
      status: 'Active'
    }
  ]

  const categories = ['all', ...new Set(parliamentActs.map(act => act.category))]

  const filteredActs = parliamentActs.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         act.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FileText className="h-12 w-12 text-primary-500 mr-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-navy-300 bg-clip-text text-transparent">
            Acts of Parliament
          </h1>
        </div>
        <p className="text-navy-300 text-lg mb-6">
          Comprehensive collection of Kenyan parliamentary legislation and statutory law
        </p>

        {/* Search and Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search acts by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass-effect rounded-xl border border-navy-700 focus:border-primary-500 bg-transparent text-white placeholder-navy-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-navy-800 text-navy-300 hover:bg-navy-700 hover:text-white'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Acts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActs.map((act, index) => (
          <div key={index} className="glass-effect rounded-xl p-6 border border-navy-700 hover:border-primary-500 transition-all duration-300 hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-navy-400" />
                <span className="text-sm text-navy-400">{act.year}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                act.status === 'Active' ? 'bg-green-600 text-green-100' : 'bg-navy-600 text-navy-100'
              }`}>
                {act.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{act.title}</h3>
            
            <div className="flex items-center mb-3">
              <Tag className="h-4 w-4 text-primary-400 mr-2" />
              <span className="text-sm text-primary-400">{act.category}</span>
            </div>

            <p className="text-navy-300 text-sm mb-4 line-clamp-3">{act.description}</p>

            <button className="w-full py-2 px-4 bg-navy-800 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
              View Full Text
            </button>
          </div>
        ))}
      </div>

      {filteredActs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-navy-600 mx-auto mb-4" />
          <p className="text-navy-400">No parliamentary acts found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default ParliamentActsPage