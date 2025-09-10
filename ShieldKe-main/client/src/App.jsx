import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ConstitutionPage from './pages/ConstitutionPage'
import ParliamentActsPage from './pages/ParliamentActsPage'
import CriminalJusticePage from './pages/CriminalJusticePage'
import CourtOrdersPage from './pages/CourtOrdersPage'
import LegalQueryPage from './pages/LegalQueryPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-navy-900 to-dark-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/constitution" element={<ConstitutionPage />} />
            <Route path="/parliament-acts" element={<ParliamentActsPage />} />
            <Route path="/criminal-justice" element={<CriminalJusticePage />} />
            <Route path="/court-orders" element={<CourtOrdersPage />} />
            <Route path="/legal-query" element={<LegalQueryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App