import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Save, Loader2, Globe, Users, FileText, Briefcase, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal'

const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Real Estate', 'Food & Beverage', 'Travel', 'Entertainment', 'Other'
]

const businessTypes = [
  'Sole Proprietor', 'Partnership', 'LLC', 'Corporation', 'Non-profit'
]

export default function BusinessProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    industry: '',
    website: '',
    about: '',
    products: '',
    target_audience: '',
    brand_tone: '',
    brand_style: '',
  })

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/business/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || '',
          type: data.type || '',
          industry: data.industry || '',
          website: data.website || '',
          about: data.about || '',
          products: data.products || '',
          target_audience: data.target_audience || '',
          brand_tone: data.brand_tone || '',
          brand_style: data.brand_style || '',
        })
        setHasProfile(true)
      } else if (response.status === 404) {
        setHasProfile(false)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/business/profile', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setModal({ isOpen: true, type: 'success', title: 'Profile Saved!', message: 'Your business profile has been updated successfully.' })
        setHasProfile(true)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Save Failed', message: 'Unable to save your business profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/business/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok || response.status === 204) {
        setModal({ isOpen: true, type: 'success', title: 'Profile Deleted!', message: 'Your business profile has been deleted.' })
        setHasProfile(false)
        setFormData({ name: '', type: '', industry: '', website: '', about: '', products: '', target_audience: '', brand_tone: '', brand_style: '' })
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Delete Failed', message: 'Unable to delete your business profile. Please try again.' })
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-accent-500 animate-spin" /></div>
  }

  return (
    <>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden"
        >
          <div className="p-6 border-b border-cream-200 bg-navy-950">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">Business Information</h2>
                <p className="text-cream-200 text-sm">Tell us about your business for better content</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Business Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                  placeholder="Your Business Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Business Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                >
                  <option value="">Select type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                >
                  <option value="">Select industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-2">About Your Business</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={4}
                className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all resize-none"
                placeholder="Tell us about your business..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-2">Products/Services</label>
              <textarea
                name="products"
                value={formData.products}
                onChange={handleChange}
                rows={3}
                className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all resize-none"
                placeholder="What products or services do you offer?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Target Audience</label>
                <input
                  type="text"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleChange}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                  placeholder="e.g., Young professionals, ages 25-40"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Brand Tone</label>
                <input
                  type="text"
                  name="brand_tone"
                  value={formData.brand_tone}
                  onChange={handleChange}
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                  placeholder="e.g., Professional & Friendly"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-2">Brand Style</label>
              <input
                type="text"
                name="brand_style"
                value={formData.brand_style}
                onChange={handleChange}
                className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 text-navy-950 placeholder-navy-400 focus:outline-none focus:ring-4 focus:ring-accent-500/20 transition-all"
                placeholder="e.g., Modern, Minimal, Bold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
              {hasProfile && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-6 rounded-xl transition-all border border-red-200 disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} type={modal.type} title={modal.title} message={modal.message} />
      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} type="warning" title="Delete Business Profile?" message="This will permanently delete your business profile. This action cannot be undone." confirmText="Delete" cancelText="Cancel" onConfirm={handleDelete} />
    </>
  )
}
