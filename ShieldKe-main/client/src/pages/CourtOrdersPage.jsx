import React, { useState } from 'react'
import { Scale, Search, Calendar, FileText, Filter, ChevronDown } from 'lucide-react'

const CourtOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourt, setSelectedCourt] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const courtOrders = [
    {
      title: 'Maraga & Another v. Attorney General & 5 Others',
      court: 'Supreme Court',
      date: '2023-03-15',
      type: 'Constitutional Petition',
      summary: 'Ruling on the validity of constitutional amendments through popular initiative',
      status: 'Final',
      citationNumber: 'Petition No. 1 of 2021'
    },
    {
      title: 'Republic v. Joseph Nkaissery & Others',
      court: 'High Court',
      date: '2023-02-28',
      type: 'Criminal Case',
      summary: 'Judgment on corruption charges and asset recovery',
      status: 'Under Appeal',
      citationNumber: 'HCCR No. 45 of 2022'
    },
    {
      title: 'Kenya Association of Manufacturers v. Cabinet Secretary',
      court: 'Court of Appeal',
      date: '2023-01-20',
      type: 'Judicial Review',
      summary: 'Challenge to taxation regulations affecting manufacturing sector',
      status: 'Final',
      citationNumber: 'Civil Appeal No. 78 of 2022'
    },
    {
      title: 'Wanjiku v. Nairobi City County',
      court: 'High Court',
      date: '2023-03-01',
      type: 'Administrative Law',
      summary: 'Illegal demolition of structures and compensation claims',
      status: 'Final',
      citationNumber: 'JR Misc. Application No. 123 of 2022'
    },
    {
      title: 'In the Matter of Baby Sagini',
      court: 'High Court',
      date: '2023-02-10',
      type: 'Family Law',
      summary: 'Child protection and custody determination',
      status: 'Final',
      citationNumber: 'Family Cause No. 56 of 2022'
    },
    {
      title: 'Coalition for Reforms & Democracy v. IEBC',
      court: 'Court of Appeal',
      date: '2022-12-15',
      type: 'Election Petition',
      summary: 'Electoral process reforms and constitutional compliance',
      status: 'Final',
      citationNumber: 'Civil Appeal No. 234 of 2022'
    }
  ]

  const courts = ['all', ...new Set(courtOrders.map(order => order.court))]
  const types = ['all', ...new Set(courtOrders.map(order => order.type))]

  const filteredOrders = courtOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourt = selectedCourt === 'all' || order.court === selectedCourt
    const matchesType = selectedType === 'all' || order.type === selectedType
    return matchesSearch && matchesCourt && matchesType
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Scale className="h-12 w-12 text-primary-500 mr-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-navy-300 bg-clip-text text-transparent">
            Court Orders & Directives
          </h1>
        </div>
        <p className="text-navy-300 text-lg mb-6">
          Access recent judicial decisions, court orders, and legal precedents from Kenyan courts
        </p>

        {/* Search and Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search court orders by case name or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass-effect rounded-xl border border-navy-700 focus:border-primary-500 bg-transparent text-white placeholder-navy-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 mx-auto px-4 py-2 glass-effect rounded-lg border border-navy-700 text-navy-300 hover:text-white transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="space-y-2">
                <label className="text-sm text-navy-400">Court Level</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="px-3 py-2 glass-effect rounded-lg border border-navy-700 bg-transparent text-white focus:border-primary-500 focus:outline-none"
                >
                  {courts.map(court => (
                    <option key={court} value={court} className="bg-dark-800">
                      {court === 'all' ? 'All Courts' : court}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-navy-400">Case Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 glass-effect rounded-lg border border-navy-700 bg-transparent text-white focus:border-primary-500 focus:outline-none"
                >
                  {types.map(type => (
                    <option key={type} value={type} className="bg-dark-800">
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Court Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order, index) => (
          <div key={index} className="glass-effect rounded-xl p-6 border border-navy-700 hover:border-primary-500 transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Final' ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'
                  }`}>
                    {order.status}
                  </span>
                  <div className="flex items-center text-navy-400 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{order.title}</h3>
                
                <div className="flex items-center space-x-4 mb-3">
                  <span className="text-primary-400 text-sm font-medium">{order.court}</span>
                  <span className="text-navy-400 text-sm">•</span>
                  <span className="text-navy-400 text-sm">{order.type}</span>
                </div>

                <p className="text-navy-300 mb-4">{order.summary}</p>

                <div className="flex items-center text-navy-400 text-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Citation: {order.citationNumber}</span>
                </div>
              </div>

              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
                  View Full Judgment
                </button>
                <button className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Scale className="h-16 w-16 text-navy-600 mx-auto mb-4" />
          <p className="text-navy-400">No court orders found matching your criteria.</p>
        </div>
      )}

      {/* Legal Notice */}
      <div className="mt-12 glass-effect rounded-xl p-6 border border-yellow-600 bg-yellow-600/10">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Legal Notice</h3>
        <p className="text-navy-300 text-sm">
          The court orders and judgments displayed here are for informational purposes only. 
          For official legal advice and current case status, please consult with a qualified legal practitioner 
          or contact the relevant court registry directly.
        </p>
      </div>
    </div>
  )
}

export default CourtOrdersPage