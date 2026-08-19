import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, MessageSquare, Zap, Globe, Clock, Sparkles } from 'lucide-react'
import Modal from '../components/Modal'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'error', title: '', message: '' })
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const showAlert = (type, title, message) => {
    setModal({ isOpen: true, type, title, message })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        window.location.href = '/dashboard'
      } else {
        showAlert('error', 'Sign In Failed', 'Invalid username or password. Please try again.')
      }
    } catch (error) {
      showAlert('error', 'Connection Error', 'Unable to connect to the server. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Sparkles, text: 'AI-Powered Content' },
    { icon: MessageSquare, text: 'Discord Approval' },
    { icon: Globe, text: 'Multi-Platform' },
    { icon: Clock, text: 'Smart Scheduling' },
  ]

  return (
    <div className="min-h-screen bg-cream-50 flex overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 relative"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-72 h-72 bg-accent-500/20 rounded-full blur-[100px]" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-accent-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px]" />
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-16 h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <span className="font-display font-bold text-5xl text-white">
              Post<span className="text-accent-500">Flow</span>
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Automate your reach.<br />
            <span className="text-accent-500">Elevate your brand.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-cream-200 text-xl mb-10 max-w-xl"
          >
            Welcome back! Sign in to continue managing your social media content.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-5 py-3 border border-white/10"
              >
                <feature.icon className="w-5 h-5 text-accent-500" />
                <span className="text-white text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-cream-50 h-screen overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-950 mb-2">
              Welcome back
            </h1>
            <p className="text-navy-600 text-base">
              Sign in to your PostFlow account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-navy-950/10 border border-cream-200"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Username or Email</label>
                <input
                  type="text"
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all text-base"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 pr-14 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all text-base"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-accent-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-cream-300 bg-cream-50 text-accent-600 focus:ring-accent-500 cursor-pointer" />
                  <span className="text-sm text-navy-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-accent-600 hover:text-accent-700 font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-cream-200 text-center">
              <p className="text-navy-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent-600 hover:text-accent-700 font-bold transition-colors">
                  Sign up free
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  )
}
