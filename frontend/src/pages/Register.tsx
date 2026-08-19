import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Check, MessageSquare, Zap, Globe, Clock, Sparkles, Users, BarChart3 } from 'lucide-react'
import Modal from '../components/Modal'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'error', title: '', message: '' })
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const showAlert = (type, title, message) => {
    setModal({ isOpen: true, type, title, message })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      showAlert('error', 'Password Mismatch', 'Passwords do not match. Please try again.')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.username,
        }),
      })
      
      if (response.ok) {
        showAlert('success', 'Account Created!', 'Your account has been created successfully. Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/login?registered=true'
        }, 1500)
      } else {
        const error = await response.json()
        showAlert('error', 'Registration Failed', error.detail || 'Unable to create account. Please try again.')
      }
    } catch (error) {
      showAlert('error', 'Connection Error', 'Unable to connect to the server. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains a number', met: /\d/.test(formData.password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
  ]

  const benefits = [
    { icon: Sparkles, title: 'AI-Powered Content', desc: 'Generate engaging posts instantly' },
    { icon: MessageSquare, title: 'Discord Approval', desc: 'Review before publishing' },
    { icon: Globe, title: 'Multi-Platform', desc: 'Facebook, Instagram, LinkedIn, Threads' },
    { icon: Users, title: 'Team Collaboration', desc: 'Work together seamlessly' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track your performance' },
    { icon: Clock, title: 'Smart Scheduling', desc: 'Post at optimal times' },
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
            className="text-cream-200 text-xl mb-12 max-w-xl"
          >
            Join thousands of brands already using PostFlow to save time and grow their audience.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <benefit.icon className="w-8 h-8 text-accent-500 mb-2" />
                <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                <p className="text-cream-200 text-sm">{benefit.desc}</p>
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
              Create your account
            </h1>
            <p className="text-navy-600 text-base">
              Start your 14-day free trial
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
                <label className="block text-sm font-semibold text-navy-800 mb-2">Username</label>
                <input
                  type="text"
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all text-base"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all text-base"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 pr-14 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all text-base"
                    placeholder="Create a strong password"
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
                
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${req.met ? 'bg-accent-500' : 'bg-cream-200'}`}>
                          {req.met && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={req.met ? 'text-accent-600 font-medium' : 'text-navy-500'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all text-base"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordRequirements.every((r) => r.met)}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-navy-500 text-sm text-center mt-6">
              By signing up, you agree to our{' '}
              <a href="#" className="text-accent-600 hover:underline font-medium">Terms</a> and{' '}
              <a href="#" className="text-accent-600 hover:underline font-medium">Privacy Policy</a>
            </p>

            <div className="mt-6 pt-6 border-t border-cream-200 text-center">
              <p className="text-navy-600">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-600 hover:text-accent-700 font-bold transition-colors">
                  Sign in
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
