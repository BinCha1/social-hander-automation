import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import Modal from '../components/Modal'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Passwords do not match.',
      })
      return
    }

    if (password.length < 8) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Password must be at least 8 characters.',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })

      if (response.ok) {
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Password Reset!',
          message: 'Your password has been reset successfully. You can now login.',
        })
        setTimeout(() => navigate('/login'), 2000)
      } else {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to reset password')
      }
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-cream-200 text-center"
        >
          <h1 className="font-display text-2xl font-bold text-navy-950 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-navy-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/login" className="text-accent-600 hover:underline font-medium">
            Go to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-navy-600 hover:text-accent-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl shadow-navy-950/10 border border-cream-200"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-navy-950 mb-2">
              Reset Password
            </h1>
            <p className="text-navy-600">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 pr-14 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                  placeholder="Enter new password"
                  required
                  minLength={8}
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

            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-5 py-4 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>

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
