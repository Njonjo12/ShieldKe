import React, { useState } from 'react'
import { Gavel, Shield, AlertTriangle, BookOpen, Users, Clock } from 'lucide-react'

const CriminalJusticePage = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const criminalJusticeTopics = [
    {
      id: 'overview',
      title: 'Justice System Overview',
      icon: Gavel,
      content: {
        title: 'Kenya Criminal Justice System',
        sections: [
          {
            heading: 'Structure of Criminal Justice',
            points: [
              'Kenya Police Service - Investigation and law enforcement',
              'Office of the Director of Public Prosecutions - Criminal prosecutions',
              'Judiciary - Court proceedings and adjudication',
              'Kenya Prisons Service - Corrections and rehabilitation'
            ]
          },
          {
            heading: 'Court Hierarchy',
            points: [
              'Supreme Court - Final appellate jurisdiction',
              'Court of Appeal - Appellate jurisdiction',
              'High Court - Original and appellate jurisdiction',
              'Magistrates Courts - Original jurisdiction for most criminal cases',
              'Kadhi Courts - Personal status matters for Muslims'
            ]
          }
        ]
      }
    },
    {
      id: 'rights',
      title: 'Rights of Accused',
      icon: Shield,
      content: {
        title: 'Constitutional Rights in Criminal Proceedings',
        sections: [
          {
            heading: 'Rights of Arrested Persons (Article 49)',
            points: [
              'Right to remain silent',
              'Right to be informed promptly of reason for arrest',
              'Right to communicate with advocate and family',
              'Right not to be compelled to make confession',
              'Right to be brought before court within 24 hours'
            ]
          },
          {
            heading: 'Rights of Accused Persons (Article 50)',
            points: [
              'Presumption of innocence',
              'Right to fair hearing within reasonable time',
              'Right to be informed of charges',
              'Right to adequate time and facilities to prepare defense',
              'Right to legal representation at state expense if substantial injustice would result',
              'Right to remain silent and not testify',
              'Right to adduce and challenge evidence'
            ]
          }
        ]
      }
    },
    {
      id: 'procedure',
      title: 'Criminal Procedure',
      icon: BookOpen,
      content: {
        title: 'Criminal Procedure and Process',
        sections: [
          {
            heading: 'Investigation Stage',
            points: [
              'Police investigation and evidence gathering',
              'Arrest procedures and constitutional requirements',
              'Search and seizure powers and limitations',
              'Interrogation procedures and rights',
              'Police file compilation and review'
            ]
          },
          {
            heading: 'Court Proceedings',
            points: [
              'Filing of charges and first appearance',
              'Plea taking and case management',
              'Pre-trial motions and applications',
              'Trial proceedings and evidence presentation',
              'Judgment and sentencing procedures'
            ]
          }
        ]
      }
    },
    {
      id: 'offenses',
      title: 'Common Offenses',
      icon: AlertTriangle,
      content: {
        title: 'Categories of Criminal Offenses',
        sections: [
          {
            heading: 'Felonies (Serious Crimes)',
            points: [
              'Murder and manslaughter',
              'Robbery with violence',
              'Defilement and sexual offenses',
              'Theft and burglary',
              'Fraud and economic crimes'
            ]
          },
          {
            heading: 'Misdemeanors (Lesser Crimes)',
            points: [
              'Simple assault',
              'Public nuisance',
              'Petty theft',
              'Traffic violations',
              'Disorderly conduct'
            ]
          }
        ]
      }
    }
  ]

  const currentTopic = criminalJusticeTopics.find(topic => topic.id === activeTab)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Gavel className="h-12 w-12 text-primary-500 mr-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-navy-300 bg-clip-text text-transparent">
            Criminal Justice System
          </h1>
        </div>
        <p className="text-navy-300 text-lg mb-6">
          Understanding Kenya's criminal justice framework, procedures, and constitutional protections
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center mb-8 space-x-2">
        {criminalJusticeTopics.map((topic) => {
          const Icon = topic.icon
          return (
            <button
              key={topic.id}
              onClick={() => setActiveTab(topic.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === topic.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'glass-effect text-navy-300 hover:text-white hover:bg-navy-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{topic.title}</span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      {currentTopic && (
        <div className="glass-effect rounded-xl p-8 border border-navy-700">
          <h2 className="text-2xl font-bold text-white mb-6">{currentTopic.content.title}</h2>
          
          <div className="space-y-8">
            {currentTopic.content.sections.map((section, index) => (
              <div key={index} className="bg-dark-800 rounded-lg p-6 border border-navy-700">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">{section.heading}</h3>
                <ul className="space-y-3">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-navy-200">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts Section */}
      <div className="mt-12 glass-effect rounded-xl p-6 border border-navy-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          Emergency Legal Contacts
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-dark-800 rounded-lg p-4 border border-navy-700">
            <h4 className="font-semibold text-primary-400 mb-2">Police Emergency</h4>
            <p className="text-navy-200">999 or 911</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-4 border border-navy-700">
            <h4 className="font-semibold text-primary-400 mb-2">Legal Aid</h4>
            <p className="text-navy-200">Kituo cha Sheria: +254 20 387 4220</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-4 border border-navy-700">
            <h4 className="font-semibold text-primary-400 mb-2">Human Rights</h4>
            <p className="text-navy-200">KNCHR: +254 20 272 4182</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CriminalJusticePage