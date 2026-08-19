import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Link2,
  Unlink,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Edit2,
  Trash2,
} from 'lucide-react'
import Modal from '../../components/Modal'

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', placeholder: 'Access Token' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', placeholder: 'Access Token' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', placeholder: 'Access Token' },
  { id: 'threads', name: 'Threads', icon: Twitter, color: 'bg-orange-500', placeholder: 'Access Token' },
]

export default function SocialAccounts() {
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    platform: 'instagram',
    account_name: '',
    account_id: '',
    access_token: '',
    refresh_token: '',
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/credentials', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setModal({
          isOpen: true,
          type: 'success',
          title: editingAccount ? 'Account Updated!' : 'Account Connected!',
          message: `Your ${formData.platform} account has been ${editingAccount ? 'updated' : 'connected'} successfully.`,
        })
        setShowModal(false)
        resetForm()
        fetchAccounts()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Connection Failed',
        message: 'Unable to connect account. Please check your credentials.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/credentials/${confirmDelete.platform}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Disconnected!',
          message: 'Account has been disconnected.',
        })
        fetchAccounts()
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to disconnect.' })
    }
    setConfirmDelete(null)
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setFormData({
      platform: account.platform,
      account_name: account.account_name || '',
      account_id: account.account_id || '',
      access_token: '',
      refresh_token: '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingAccount(null)
    setFormData({
      platform: 'instagram',
      account_name: '',
      account_id: '',
      access_token: '',
      refresh_token: '',
    })
  }

  const openConnectModal = (platformId) => {
    resetForm()
    setFormData((prev) => ({ ...prev, platform: platformId }))
    setShowModal(true)
  }

  const getAccountByPlatform = (platformId) => {
    return accounts.find((a) => a.platform === platformId)
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLATFORMS.map((platform) => {
            const account = getAccountByPlatform(platform.id)
            const isConnected = !!account

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
                  isConnected ? 'border-accent-200' : 'border-cream-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${platform.color} flex items-center justify-center flex-shrink-0`}>
                    <platform.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-navy-950">{platform.name}</h3>
                      {isConnected ? (
                        <div className="flex items-center gap-1 text-accent-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-navy-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Not connected</span>
                        </div>
                      )}
                    </div>

                    {isConnected ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-navy-600">
                          <span className="font-medium">Account:</span>
                          <span>{account.account_name || account.account_id}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(account)}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-cream-50 hover:bg-cream-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(account)}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Unlink className="w-4 h-4" /> Disconnect
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button
                          onClick={() => openConnectModal(platform.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-all"
                        >
                          <Link2 className="w-4 h-4" /> Connect
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
          >
            <div className="p-6 border-b border-cream-200">
              <h2 className="font-display text-xl font-bold text-navy-950">
                {editingAccount ? 'Update' : 'Connect'} {PLATFORMS.find((p) => p.id === formData.platform)?.name}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Account Name</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                  placeholder="Your page or profile name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Account ID</label>
                <input
                  type="text"
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                  placeholder="Page or account ID"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Access Token</label>
                <input
                  type="password"
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                  placeholder="Enter access token"
                  required={!editingAccount}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Refresh Token (Optional)</label>
                <input
                  type="password"
                  value={formData.refresh_token}
                  onChange={(e) => setFormData({ ...formData, refresh_token: e.target.value })}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                  placeholder="Enter refresh token"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 py-3 border-2 border-cream-200 text-navy-700 font-semibold rounded-xl hover:bg-cream-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingAccount ? 'Update' : 'Connect'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        type="warning"
        title="Disconnect Account?"
        message="This will remove the connection. You'll need to reconnect to use this platform."
        confirmText="Disconnect"
        cancelText="Cancel"
        onConfirm={handleDelete}
      />
      </>
  )
}
