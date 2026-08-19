import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Business Profile', path: '/dashboard/business' },
  { icon: FileText, label: 'Content', path: '/dashboard/content' },
  { icon: Users, label: 'Social Accounts', path: '/dashboard/accounts' },
  { icon: MessageSquare, label: 'Discord', path: '/dashboard/discord' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
]

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const currentPage = navItems.find(item => item.path === location.pathname)

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-navy-950 shadow-2xl lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl text-white">
                Post<span className="text-accent-500">Flow</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                      : 'text-cream-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-cream-200 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-cream-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-navy-700" />
            </button>
            <span className="font-display font-bold text-lg text-navy-950">
              Post<span className="text-accent-600">Flow</span>
            </span>
            <div className="w-10" />
          </div>
        </header>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="absolute inset-y-0 left-0 w-72"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="font-display font-bold text-2xl text-white">
                    Post<span className="text-accent-500">Flow</span>
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-accent-500 text-white'
                            : 'text-cream-200 hover:bg-white/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {currentPage && (
              <div className="mb-6">
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-navy-950">
                  {currentPage.label}
                </h1>
                <p className="text-navy-500 mt-1">
                  Manage your {currentPage.label.toLowerCase()} here
                </p>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
