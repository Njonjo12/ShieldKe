import React, { useState } from 'react'
import { Book, Search, ChevronDown, ChevronRight } from 'lucide-react'

const ConstitutionPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedChapter, setExpandedChapter] = useState(null)

  const constitutionChapters = [
    {
      chapter: 'Chapter 1',
      title: 'Sovereignty of the People and Supremacy of the Constitution',
      articles: [
        'Article 1 - Sovereignty of the people',
        'Article 2 - Supremacy of the Constitution',
        'Article 3 - Defence of the Constitution'
      ]
    },
    {
      chapter: 'Chapter 2',
      title: 'The Republic',
      articles: [
        'Article 4 - National symbols',
        'Article 5 - Territory of Kenya',
        'Article 6 - Devolution',
        'Article 7 - National, official and other languages',
        'Article 8 - The State and religion',
        'Article 9 - The national culture'
      ]
    },
    {
      chapter: 'Chapter 3',
      title: 'Citizenship',
      articles: [
        'Article 10 - National values and principles of governance',
        'Article 11 - Culture',
        'Article 12 - National days',
        'Article 13 - Citizenship',
        'Article 14 - Citizenship by birth',
        'Article 15 - Citizenship by registration',
        'Article 16 - Dual citizenship',
        'Article 17 - Legislation on citizenship',
        'Article 18 - Citizens by birth who acquired citizenship of another country'
      ]
    },
    {
      chapter: 'Chapter 4',
      title: 'The Bill of Rights',
      articles: [
        'Article 19 - Rights and fundamental freedoms',
        'Article 20 - Application of Bill of Rights',
        'Article 21 - Implementation of rights and fundamental freedoms',
        'Article 22 - Enforcement of Bill of Rights',
        'Article 23 - Authority to limit rights and fundamental freedoms',
        'Article 24 - Limitation of rights and fundamental freedoms',
        'Article 25 - Fundamental rights and freedoms that cannot be limited',
        'Article 26 - Right to life',
        'Article 27 - Equality and freedom from discrimination',
        'Article 28 - Human dignity',
        'Article 29 - Freedom and security of the person',
        'Article 30 - Freedom from slavery, servitude and forced labour',
        'Article 31 - Privacy',
        'Article 32 - Freedom of conscience, religion, belief and opinion',
        'Article 33 - Freedom of expression',
        'Article 34 - Freedom of the media',
        'Article 35 - Access to information',
        'Article 36 - Freedom of association',
        'Article 37 - Freedom of assembly, demonstration, picketing and petition',
        'Article 38 - Political rights',
        'Article 39 - Freedom of movement and residence',
        'Article 40 - Protection of right to property',
        'Article 41 - Labour relations',
        'Article 42 - Environment',
        'Article 43 - Economic and social rights',
        'Article 44 - Language and culture',
        'Article 45 - Family',
        'Article 46 - Consumer rights',
        'Article 47 - Fair administrative action',
        'Article 48 - Access to justice',
        'Article 49 - Rights of arrested persons',
        'Article 50 - Fair hearing',
        'Article 51 - Rights of persons detained, held in custody or imprisoned',
        'Article 52 - Rights of accused persons',
        'Article 53 - Children',
        'Article 54 - Persons with disabilities',
        'Article 55 - Youth',
        'Article 56 - Minorities and marginalized groups',
        'Article 57 - Older members of society'
      ]
    },
    {
      chapter: 'Chapter 5',
      title: 'Land and Environment',
      articles: [
        'Article 58 - Land tenure',
        'Article 59 - Classification of land',
        'Article 60 - Principles of land policy',
        'Article 61 - Public land',
        'Article 62 - Private land',
        'Article 63 - Community land',
        'Article 64 - Land and Land Commissions',
        'Article 65 - Right to property',
        'Article 66 - Regulation of land use and property',
        'Article 67 - Land Commission',
        'Article 68 - Legislation on land',
        'Article 69 - Obligations in respect of the environment',
        'Article 70 - Enforcement of environmental rights',
        'Article 71 - Agreements relating to natural resources',
        'Article 72 - Legislation relating to the environment'
      ]
    },
    {
      chapter: 'Chapter 6',
      title: 'Leadership and Integrity',
      articles: [
        'Article 73 - Authority assigned to State officers',
        'Article 74 - Oath of office of State officers',
        'Article 75 - Conduct of State officers',
        'Article 76 - Financial probity of State officers',
        'Article 77 - Restriction on activities of State officers',
        'Article 78 - Citizenship and leadership',
        'Article 79 - Legislation on leadership',
        'Article 80 - Ethics and Anti-Corruption Commission',
        'Article 81 - Establishment of offices'
      ]
    },
    {
      chapter: 'Chapter 7',
      title: 'Representation of the People',
      articles: [
        'Article 82 - Sovereignty of the people',
        'Article 83 - Registration as a voter',
        'Article 84 - Voting',
        'Article 85 - Voters roll',
        'Article 86 - Constituencies and wards',
        'Article 87 - Boundary reviews',
        'Article 88 - Independent Electoral and Boundaries Commission',
        'Article 89 - Elections',
        'Article 90 - Political parties',
        'Article 91 - Legislation on political parties',
        'Article 92 - Public officers not to influence elections',
        'Article 93 - Rejection of electoral process',
        'Article 94 - Public officers not to influence elections'
      ]
    },
    {
      chapter: 'Chapter 8',
      title: 'The Legislature',
      articles: [
        'Article 95 - Role of Parliament',
        'Article 96 - Membership of National Assembly',
        'Article 97 - Membership of National Assembly',
        'Article 98 - Membership of the Senate',
        'Article 99 - Election of members of Parliament',
        'Article 100 - Qualifications and disqualifications for election as member of Parliament',
        'Article 101 - Vacation of office of member of Parliament',
        'Article 102 - Determination of questions of membership',
        'Article 103 - Right of recall',
        'Article 104 - Public participation and involvement',
        'Article 105 - Powers of Parliament',
        'Article 106 - Role of National Assembly',
        'Article 107 - Role of the Senate',
        'Article 108 - Exercise of legislative powers',
        'Article 109 - Introduction of Bills',
        'Article 110 - Ordinary Bills concerning County Governments',
        'Article 111 - Money Bills',
        'Article 112 - Presidential assent and referral',
        'Article 113 - Enactment of Bills',
        'Article 114 - Powers, privileges and immunities',
        'Article 115 - Right to petition Parliament',
        'Article 116 - Public access and participation',
        'Article 117 - Official languages of Parliament',
        'Article 118 - Public access and participation',
        'Article 119 - Qualifications of members',
        'Article 120 - Presiding officers',
        'Article 121 - Clerk of the Senate and Clerk of the National Assembly',
        'Article 122 - Sessions of Parliament',
        'Article 123 - Voting in Parliament',
        'Article 124 - Quorum',
        'Article 125 - Committees of Parliament',
        'Article 126 - Powers of committees',
        'Article 127 - Determination of membership',
        'Article 128 - Parliamentary Service Commission'
      ]
    },
    {
      chapter: 'Chapter 9',
      title: 'The Executive',
      articles: [
        'Article 129 - Principles of executive authority',
        'Article 130 - The President',
        'Article 131 - Authority of the President',
        'Article 132 - Functions of the President',
        'Article 133 - Responsibility of the President',
        'Article 134 - Election of the President',
        'Article 135 - Qualifications and disqualifications for election as President',
        'Article 136 - Term of office of the President',
        'Article 137 - Vacancy in the office of President',
        'Article 138 - Acting President',
        'Article 139 - Deputy President',
        'Article 140 - Functions of the Deputy President',
        'Article 141 - Election of the Deputy President',
        'Article 142 - Vacancy in the office of Deputy President',
        'Article 143 - Assumption of office of President',
        'Article 144 - Oath of affirmation of President',
        'Article 145 - Impeachment of the President',
        'Article 146 - Powers of the President',
        'Article 147 - The Cabinet',
        'Article 148 - Deputy Ministers',
        'Article 149 - Assistant Ministers',
        'Article 150 - Accountability of the Cabinet',
        'Article 151 - Accountability of Cabinet Secretaries',
        'Article 152 - Attorney-General',
        'Article 153 - Secretary to the Cabinet',
        'Article 154 - Director of Public Prosecutions',
        'Article 155 - Powers of mercy'
      ]
    },
    {
      chapter: 'Chapter 10',
      title: 'The Judiciary',
      articles: [
        'Article 156 - Judicial authority',
        'Article 157 - Guiding principles for the exercise of judicial authority',
        'Article 158 - Independence of the Judiciary',
        'Article 159 - Judicial offices and officers',
        'Article 160 - Structure of the courts',
        'Article 161 - Establishment of the superior courts',
        'Article 162 - System of courts',
        'Article 163 - Supreme Court',
        'Article 164 - Jurisdiction of the Supreme Court',
        'Article 165 - Court of Appeal',
        'Article 166 - High Court',
        'Article 167 - Subordinate courts',
        'Article 168 - Appointment of judges',
        'Article 169 - Removal from office',
        'Article 170 - Administrative independence',
        'Article 171 - Establishment of the Judicial Service Commission',
        'Article 172 - Functions of the Judicial Service Commission',
        'Article 173 - Kenya Law Reform Commission'
      ]
    },
    {
      chapter: 'Chapter 11',
      title: 'Devolved Government',
      articles: [
        'Article 174 - Objects of devolution',
        'Article 175 - Principles of devolved government',
        'Article 176 - County governments',
        'Article 177 - Membership of county assembly',
        'Article 178 - Election of members of county assemblies',
        'Article 179 - Qualifications and disqualifications for election as member of county assembly',
        'Article 180 - County governor and deputy county governor',
        'Article 181 - Election of county governor',
        'Article 182 - Functions of the county governor',
        'Article 183 - The county executive committee',
        'Article 184 - Urban areas and cities',
        'Article 185 - Legislative authority of county governments',
        'Article 186 - Respective functions and powers of national and county governments',
        'Article 187 - Transfer of functions and powers between levels of government',
        'Article 188 - Cooperation between national and county governments',
        'Article 189 - Cooperation between county governments',
        'Article 190 - Support for county governments',
        'Article 191 - Removal of a county governor',
        'Article 192 - County assembly service boards',
        'Article 193 - County public service boards',
        'Article 194 - County governments',
        'Article 195 - County assemblies',
        'Article 196 - Procedures of county assemblies',
        'Article 197 - County executive committees',
        'Article 198 - County public service',
        'Article 199 - Transition to devolved government',
        'Article 200 - Publication and notification of county legislation'
      ]
    },
    {
      chapter: 'Chapter 12',
      title: 'Public Finance',
      articles: [
        'Article 201 - Principles of public finance',
        'Article 202 - Revenue raising powers',
        'Article 203 - Equitable sharing of national revenue',
        'Article 204 - Equitable sharing of revenue raised by county governments',
        'Article 205 - Criteria for determining equitable sharing of revenue',
        'Article 206 - Loans by county governments',
        'Article 207 - Accountability for public finances',
        'Article 208 - Contingencies Fund',
        'Article 209 - Consolidated Fund',
        'Article 210 - Withdrawal from the Consolidated Fund',
        'Article 211 - County Revenue Fund',
        'Article 212 - Appropriation Bills',
        'Article 213 - County appropriation Bill',
        'Article 214 - Annual Division of Revenue Bill',
        'Article 215 - Annual County Allocation of Revenue Bill',
        'Article 216 - Financial control',
        'Article 217 - Procurement of public goods and services',
        'Article 218 - Disposal of public property',
        'Article 219 - Borrowing by the national government',
        'Article 220 - Auditor-General',
        'Article 221 - Audit of public finances',
        'Article 222 - Accounts and audit of county governments',
        'Article 223 - Access to information',
        'Article 224 - Salaries and Remuneration Commission',
        'Article 225 - Parliamentary powers over county taxes',
        'Article 226 - Remuneration of state officers',
        'Article 227 - Legislation on public finance',
        'Article 228 - Controller of Budget',
        'Article 229 - Functions of the Controller of Budget',
        'Article 230 - Public debt',
        'Article 231 - Revenue Allocation Commission',
        'Article 232 - Functions of Commission on Revenue Allocation',
        'Article 233 - Public debt and expenditure',
        'Article 234 - Financial management'
      ]
    },
    {
      chapter: 'Chapter 13',
      title: 'The Public Service',
      articles: [
        'Article 235 - Values and principles of public service',
        'Article 236 - Public Service Commission',
        'Article 237 - Functions and powers of the Public Service Commission',
        'Article 238 - County public service',
        'Article 239 - Teachers Service Commission',
        'Article 240 - Functions of the Teachers Service Commission',
        'Article 241 - Other commissions for the public service',
        'Article 242 - Functions of commissions'
      ]
    },
    {
      chapter: 'Chapter 14',
      title: 'National Security',
      articles: [
        'Article 243 - Guiding principles of national security',
        'Article 244 - National Security Council',
        'Article 245 - National security organs',
        'Article 246 - The Kenya Defence Forces',
        'Article 247 - Command of the National Police Service',
        'Article 248 - National Intelligence Service',
        'Article 249 - Civilian authority over national security organs',
        'Article 250 - Principles for national security organs',
        'Article 251 - Establishment and dissolution of offices'
      ]
    },
    {
      chapter: 'Chapter 15',
      title: 'Commissions and Independent Offices',
      articles: [
        'Article 252 - Interpretation',
        'Article 253 - Objects, authority and mandate of commissions',
        'Article 254 - Independence of commissions',
        'Article 255 - Incorporation of commissions',
        'Article 256 - Composition and appointment',
        'Article 257 - Removal from office'
      ]
    },
    {
      chapter: 'Chapter 16',
      title: 'Amendment of this Constitution',
      articles: [
        'Article 258 - Amendment by referendum',
        'Article 259 - Amendment by Parliament',
        'Article 260 - Amendment by county assemblies',
        'Article 261 - Amendments requiring referendum',
        'Article 262 - Procedure for amendment by referendum',
        'Article 263 - Limitation on the power to amend this Constitution'
      ]
    },
    {
      chapter: 'Chapter 17',
      title: 'General Provisions',
      articles: [
        'Article 264 - Institutions of government',
        'Article 265 - Public seal and coat of arms',
        'Article 266 - The national flag, national anthem and public seal',
        'Article 267 - Interpretation',
        'Article 268 - Commencement'
      ]
    },
    {
      chapter: 'Chapter 18',
      title: 'Transitional and Consequential Provisions',
      articles: [
        'Article 269 - Effective date',
        'Article 270 - National values and principles of governance',
        'Article 271 - Existing offices',
        'Article 272 - Existing agreements and treaties',
        'Article 273 - Existing operational frameworks',
        'Article 274 - Existing laws',
        'Article 275 - Transitional and consequential provisions',
        'First Schedule - County boundaries and headquarters',
        'Second Schedule - National oath and affirmation of allegiance',
        'Third Schedule - Oaths and solemn affirmations',
        'Fourth Schedule - Distribution of functions between the national government and county governments',
        'Fifth Schedule - Provisions as to the Commissions and the holders of independent offices',
        'Sixth Schedule - Transitional and consequential provisions'
      ]
    }
  ]

  const filteredChapters = constitutionChapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.articles.some(article => article.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Book className="h-12 w-12 text-primary-500 mr-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-navy-300 bg-clip-text text-transparent">
            The Constitution of Kenya
          </h1>
        </div>
        <p className="text-navy-300 text-lg mb-6">
          Explore the fundamental law of the Republic of Kenya, adopted in 2010
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search constitutional articles and provisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass-effect rounded-xl border border-navy-700 focus:border-primary-500 bg-transparent text-white placeholder-navy-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Constitution Chapters */}
      <div className="space-y-4">
        {filteredChapters.map((chapter, index) => (
          <div key={index} className="glass-effect rounded-xl border border-navy-700">
            <button
              onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-navy-800/50 transition-colors duration-200"
            >
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{chapter.chapter}</h3>
                <p className="text-navy-300">{chapter.title}</p>
              </div>
              {expandedChapter === index ? (
                <ChevronDown className="h-5 w-5 text-navy-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-navy-400" />
              )}
            </button>
            
            {expandedChapter === index && (
              <div className="px-6 pb-6 border-t border-navy-700">
                <div className="mt-4 space-y-2">
                  {chapter.articles.map((article, articleIndex) => (
                    <div key={articleIndex} className="p-3 bg-dark-800 rounded-lg border border-navy-700 hover:border-primary-500 transition-colors duration-200">
                      <p className="text-navy-200 text-sm">{article}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-12">
          <Book className="h-16 w-16 text-navy-600 mx-auto mb-4" />
          <p className="text-navy-400">No constitutional provisions found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default ConstitutionPage