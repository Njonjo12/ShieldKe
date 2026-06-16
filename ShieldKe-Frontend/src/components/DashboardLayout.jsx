// src/components/DashboardLayout.jsx
export default function DashboardLayout({ title, children, onLogout }) {
    return (
      <div className="min-h-screen flex bg-slate-100">
        {/* Sidebar */}
        <aside className="w-64 bg-black text-white p-6">
          <h2 className="text-xl font-bold mb-6">ShieldKe</h2>
  
          <nav className="space-y-3 text-sm">
            <p className="text-gray-400 uppercase">Dashboard</p>
            <p className="hover:text-green-400 cursor-pointer">Profile</p>
            <p className="hover:text-green-400 cursor-pointer">Cases</p>
            <p className="hover:text-green-400 cursor-pointer">Messages</p>
          </nav>
  
          <button
            onClick={onLogout}
            className="mt-10 w-full bg-red-600 hover:bg-red-700 py-2 rounded"
          >
            Logout
          </button>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          {children}
        </main>
      </div>
    );
  }
  