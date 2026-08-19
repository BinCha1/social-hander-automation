import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Loader2,
  Moon,
  Sun,
  CheckCircle,
} from 'lucide-react'
import Modal from '../../components/Modal'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState({ username: '', email: '', full_name: '', is_active: true })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/auth/users/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Settings Saved!',
      message: 'Your preferences have been updated.',
    })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
      </div>
    )
  }

  return (
      <>
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-64 p-6 border-b md:border-b-0 md:border-r border-cream-200 bg-cream-50">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                        : 'text-navy-700 hover:bg-cream-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-navy-950 mb-1">Profile Settings</h2>
                    <p className="text-navy-500 text-sm">Manage your account information</p>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-accent-500 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">{user.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-accent-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{user.is_active ? 'Active account' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">Username</label>
                      <input
                        type="text"
                        value={user.username}
                        disabled
                        className="w-full bg-cream-100 border-2 border-cream-200 rounded-xl px-4 py-3 text-navy-500"
                      />
                      <p className="text-xs text-navy-400 mt-1">Username cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-cream-100 border-2 border-cream-200 rounded-xl px-4 py-3 text-navy-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user.full_name}
                      className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-navy-950 mb-1">Notification Preferences</h2>
                    <p className="text-navy-500 text-sm">Choose what you want to be notified about</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Content approved', desc: 'When your content is approved for publishing', enabled: true },
                      { label: 'Content published', desc: 'When your content is successfully published', enabled: true },
                      { label: 'Discord notifications', desc: 'When you receive approval requests in Discord', enabled: false },
                      { label: 'Weekly digest', desc: 'Weekly summary of your content performance', enabled: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                        <div>
                          <p className="font-medium text-navy-950">{item.label}</p>
                          <p className="text-sm text-navy-500">{item.desc}</p>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition-colors ${
                            item.enabled ? 'bg-accent-500' : 'bg-cream-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-navy-950 mb-1">Security Settings</h2>
                    <p className="text-navy-500 text-sm">Keep your account secure</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-cream-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-navy-950">Change Password</p>
                          <p className="text-sm text-navy-500">Update your password regularly</p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-cream-200 rounded-lg text-sm font-medium text-navy-700 hover:bg-white/80 transition-all">
                          Update
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-cream-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-navy-950">Two-Factor Authentication</p>
                          <p className="text-sm text-navy-500">Add an extra layer of security</p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-cream-200 rounded-lg text-sm font-medium text-navy-700 hover:bg-white/80 transition-all">
                          Enable
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-cream-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-navy-950">Active Sessions</p>
                          <p className="text-sm text-navy-500">Manage your active sessions</p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-cream-200 rounded-lg text-sm font-medium text-navy-700 hover:bg-white/80 transition-all">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-navy-950 mb-1">Appearance</h2>
                    <p className="text-navy-500 text-sm">Customize how PostFlow looks</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-cream-50 rounded-xl border-2 border-accent-500 text-center">
                      <Sun className="w-8 h-8 mx-auto mb-2 text-accent-600" />
                      <p className="font-medium text-navy-950">Light</p>
                    </button>
                    <button className="p-4 bg-navy-900 rounded-xl border-2 border-cream-200 text-center">
                      <Moon className="w-8 h-8 mx-auto mb-2 text-cream-200" />
                      <p className="font-medium text-cream-200">Dark</p>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="flex justify-end pt-6 mt-6 border-t border-cream-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-accent-500/30 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
      </>
  )
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]
