import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, CheckCircle, XCircle, Loader2, Settings, Zap, Hash, Bot } from 'lucide-react'
import Modal from '../../components/Modal'

export default function DiscordIntegration() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [config, setConfig] = useState(null)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '', confirmText: null, onConfirm: null })
  const [formData, setFormData] = useState({
    bot_token: '',
    application_id: '',
    channel_id: '',
    is_active: true,
  })

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/integrations/discord/config', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        setFormData({
          bot_token: '',
          application_id: data.application_id || '',
          channel_id: data.channel_id || '',
          is_active: data.is_active ?? true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch Discord config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/integrations/discord/config', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        setModal({
          isOpen: true,
          type: data.connection_status === 'connected' ? 'success' : 'error',
          title: data.connection_status === 'connected' ? 'Discord Connected!' : 'Connection Issue',
          message: data.connection_status === 'connected'
            ? 'Your Discord bot is connected and ready.'
            : `Connection failed: ${data.last_error || 'Unknown error'}`,
        })
        setFormData((prev) => ({ ...prev, bot_token: '' }))
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Save Failed', message: 'Unable to save Discord configuration.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/integrations/discord/config', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        setConfig(null)
        setFormData({ bot_token: '', application_id: '', channel_id: '', is_active: true })
        setModal({ isOpen: true, type: 'success', title: 'Discord Disconnected', message: 'Your Discord integration has been removed.' })
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to disconnect Discord.' })
    }
  }

  const toggleActive = async () => {
    const token = localStorage.getItem('token')
    await fetch('/api/integrations/discord/config', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !config.is_active }),
    })
    fetchConfig()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-accent-500 animate-spin" /></div>
  }

  return (
    <>
      <div className="w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden"
        >
          <div className="p-6 border-b border-cream-200 bg-navy-950">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">Discord Integration</h2>
                <p className="text-cream-200 text-sm">Connect to approve content via Discord</p>
              </div>
            </div>
          </div>

          {config && (
            <div className="p-6 bg-cream-50 border-b border-cream-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config.connection_status === 'connected' ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-accent-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-950 flex items-center gap-2">
                          <Bot className="w-4 h-4" /> {config.bot_name || 'Connected'}
                        </p>
                        <p className="text-sm text-navy-500">Channel: {config.channel_id || 'Not set'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-950">Not Connected</p>
                        <p className="text-sm text-red-500">{config.last_error || 'Invalid credentials'}</p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={toggleActive}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    config.is_active ? 'bg-accent-500 text-white' : 'bg-cream-200 text-navy-600'
                  }`}
                >
                  {config.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-2">Bot Token *</label>
              <input
                type="password"
                value={formData.bot_token}
                onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
                className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                placeholder={config?.encrypted_bot_token ? 'Leave empty to keep current' : 'Enter your Discord bot token'}
              />
              <p className="text-xs text-navy-500 mt-1">Leave empty to keep current token</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Application ID</label>
                <input
                  type="text"
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                  placeholder="Application ID"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Channel ID</label>
                <input
                  type="text"
                  value={formData.channel_id}
                  onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                  placeholder="Channel for approvals"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                {saving ? 'Saving...' : config ? 'Update Settings' : 'Connect Discord'}
              </button>
              {config && (
                <>
                  <button
                    type="button"
                    onClick={() => setModal({ isOpen: true, type: 'warning', title: 'Disconnect Discord?', message: 'This will remove your Discord integration.', confirmText: 'Disconnect', onConfirm: handleDelete })}
                    className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200"
        >
          <h3 className="font-display text-lg font-bold text-navy-950 mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-navy-950">Create content in PostFlow</p>
                <p className="text-sm text-navy-500">Generate posts for Instagram, Facebook, LinkedIn, and Threads</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-navy-950">Review in Discord</p>
                <p className="text-sm text-navy-500">Content is sent to your configured channel for approval</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-navy-950">Approve or Decline</p>
                <p className="text-sm text-navy-500">Use Discord buttons to approve or decline the campaign</p>
              </div>
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
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
      />
    </>
  )
}
