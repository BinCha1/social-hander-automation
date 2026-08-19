import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  User,
} from 'lucide-react'
import { Outlet } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Business Profile', path: '/dashboard/business' },
  { icon: FileText, label: 'Content', path: '/dashboard/content' },
  { icon: Users, label: 'Social Accounts', path: '/dashboard/accounts' },
  { icon: MessageSquare, label: 'Discord', path: '/dashboard/discord' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    } else {
      setIsAuthenticated(true)
      fetchUser(token)
    }
  }, [navigate])

  const fetchUser = async (token) => {
    try {
      const response = await fetch('/api/v1/auth/users/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

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

  const currentNav = navItems.find(item => item.path === location.pathname) || navItems[0]

  if (isAuthenticated === null) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-navy-950 shadow-2xl lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <span className="font-display font-bold text-2xl text-white">
              Post<span className="text-accent-500">Flow</span>
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                      : 'text-cream-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
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

        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-cream-200">
          <div>
            <h1 className="font-display text-xl font-semibold text-navy-950">{currentNav.label}</h1>
            {user && <p className="text-sm text-navy-500">Welcome back, {user.full_name || user.username}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 bg-cream-50 border border-cream-200 rounded-lg pl-10 pr-4 py-2 text-sm text-navy-950 placeholder-navy-400 focus:outline-none focus:border-accent-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center">
                <User className="w-5 h-5 text-accent-600" />
              </div>
              {user && (
                <div className="text-sm">
                  <p className="font-medium text-navy-950">{user.full_name || user.username}</p>
                  <p className="text-navy-500 text-xs">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive ? 'bg-accent-500 text-white' : 'text-cream-200 hover:bg-white/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  )
}
