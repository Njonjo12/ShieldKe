import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Scale, Book, Gavel, FileText, Search, Shield } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Constitution', path: '/constitution', icon: Book },
    { name: 'Parliament Acts', path: '/parliament-acts', icon: FileText },
    { name: 'Criminal Justice', path: '/criminal-justice', icon: Gavel },
    { name: 'Court Orders', path: '/court-orders', icon: Scale },
    { name: 'Legal Query', path: '/legal-query', icon: Search },
  ]

  return (
    <nav className="glass-effect border-b border-navy-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-navy-300 bg-clip-text text-transparent">
              ShieldKe
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-navy-300 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar