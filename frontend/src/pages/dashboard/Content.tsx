import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  XCircle,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Image,
  Video,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Modal from '../../components/Modal'

const PLATFORM_ICONS = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin, threads: Twitter }

const API_MODE_OPTIONS = ['instant', 'schedule']
const API_STATUS_OPTIONS = ['pending', 'processing', 'done', 'failed']
const SUPPORTED_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'threads']
const API_GOAL_OPTIONS = ['Product Promotion', 'Brand Awareness', 'Engagement', 'Traffic']
const PAGE_SIZE = 10

export default function ContentManagement() {
  const [loading, setLoading] = useState(true)
  const [contents, setContents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    topic: '',
    platforms: [],
    goal: 'Product Promotion',
    cta: '',
    user_prompt: '',
    preferred_media: 'image',
    user_image_url: '',
    user_video_url: '',
    media_instructions: '',
    mode: 'schedule',
    publish_date: '',
    publish_time: '',
  })

  useEffect(() => { fetchContents() }, [page, statusFilter])

  const fetchContents = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: PAGE_SIZE.toString(),
      })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      const response = await fetch(`/api/v1/content?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setContents(data.items)
        setTotal(data.total)
        setTotalPages(data.total_pages)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const url = editingContent ? `/api/v1/content/${editingContent.id}` : '/api/v1/content'
      const method = editingContent ? 'PUT' : 'POST'
      
      const payload = {
        topic: formData.topic,
        platforms: formData.platforms,
        goal: formData.goal || undefined,
        cta: formData.cta || undefined,
        user_prompt: formData.user_prompt || undefined,
        preferred_media: formData.preferred_media,
        user_image_url: formData.user_image_url || undefined,
        user_video_url: formData.user_video_url || undefined,
        media_instructions: formData.media_instructions || undefined,
        mode: formData.mode,
        publish_date: formData.publish_date || undefined,
        publish_time: formData.publish_time || undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (response.ok) {
        setModal({ isOpen: true, type: 'success', title: editingContent ? 'Content Updated!' : 'Content Created!', message: 'Your content has been saved successfully.' })
        setShowCreateModal(false)
        setEditingContent(null)
        resetForm()
        fetchContents()
      } else {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to save')
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Save Failed', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/content/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok || response.status === 204) {
        setModal({ isOpen: true, type: 'success', title: 'Deleted!', message: 'Content has been deleted.' })
        fetchContents()
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete content.' })
    }
    setConfirmDelete(null)
  }

  const handleStatusChange = async (content, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/content/${content.id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setModal({ isOpen: true, type: 'success', title: 'Status Updated!', message: `Content status changed to ${newStatus}.` })
        fetchContents()
      }
    } catch (error) {
      setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to update status.' })
    }
  }

  const handleEdit = (content) => {
    setEditingContent(content)
    setFormData({
      topic: content.topic || '',
      platforms: content.platforms || [],
      goal: content.goal || 'Product Promotion',
      cta: content.cta || '',
      user_prompt: content.user_prompt || '',
      preferred_media: content.preferred_media || 'image',
      user_image_url: content.user_image_url || '',
      user_video_url: content.user_video_url || '',
      media_instructions: content.media_instructions || '',
      mode: content.mode || 'schedule',
      publish_date: content.publish_date || '',
      publish_time: content.publish_time || '',
    })
    setShowCreateModal(true)
  }

  const resetForm = () => {
    setFormData({ topic: '', platforms: [], goal: 'Product Promotion', cta: '', user_prompt: '', preferred_media: 'image', user_image_url: '', user_video_url: '', media_instructions: '', mode: 'schedule', publish_date: '', publish_time: '' })
  }

  const togglePlatform = (platform) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform) ? prev.platforms.filter((p) => p !== platform) : [...prev.platforms, platform],
    }))
  }

  const filteredContents = contents.filter((c) => {
    const matchesSearch = c.topic?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-accent-500 animate-spin" /></div>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input type="text" placeholder="Search content..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border-2 border-cream-200 rounded-xl focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/20" />
          </div>
          <div className="flex gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-white border-2 border-cream-200 rounded-xl focus:border-accent-500 focus:outline-none">
              <option value="all">All Status</option>
              {API_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button onClick={() => { resetForm(); setEditingContent(null); setShowCreateModal(true) }} className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-accent-500/30">
              <Plus className="w-5 h-5" /> Create
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-navy-700">Topic</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-navy-700">Platforms</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-navy-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-navy-700">Mode</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-navy-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No content found</p>
                      <button onClick={() => setShowCreateModal(true)} className="mt-3 text-accent-600 hover:underline font-medium">Create your first content</button>
                    </td>
                  </tr>
                ) : filteredContents.map((content, i) => (
                  <motion.tr key={content.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-navy-950">{content.topic || 'Untitled'}</p>
                        <p className="text-sm text-navy-500 truncate max-w-xs">{content.goal}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {(content.platforms || []).map((p) => {
                          const Icon = PLATFORM_ICONS[p.toLowerCase()] || Globe
                          return <div key={p} className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center"><Icon className="w-4 h-4 text-navy-600" /></div>
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={content.status} 
                        onChange={(e) => handleStatusChange(content, e.target.value)}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border-0 cursor-pointer"
                      >
                        {API_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-navy-600">{content.mode}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(content)} className="p-2 hover:bg-cream-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-navy-600" /></button>
                        <button onClick={() => setConfirmDelete(content)} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-cream-200">
              <p className="text-sm text-navy-500">
                Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-navy-600" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-accent-500 text-white'
                          : 'hover:bg-cream-100 text-navy-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-navy-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-navy-950">{editingContent ? 'Edit Content' : 'Create Content'}</h2>
              <button onClick={() => { setShowCreateModal(false); setEditingContent(null); resetForm() }} className="p-2 hover:bg-cream-100 rounded-lg"><XCircle className="w-5 h-5 text-navy-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Topic *</label>
                <input type="text" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20" placeholder="What's the main topic?" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Platforms *</label>
                <div className="flex gap-3">
                  {SUPPORTED_PLATFORMS.map((platform) => (
                    <button key={platform} type="button" onClick={() => togglePlatform(platform)} className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium capitalize transition-all ${formData.platforms.includes(platform) ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-cream-200 text-navy-600 hover:border-cream-300'}`}>
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-2">Goal</label>
                  <select value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none">
                    {API_GOAL_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-2">Mode</label>
                  <select value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none">
                    {API_MODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Call to Action</label>
                <input type="text" value={formData.cta} onChange={(e) => setFormData({ ...formData, cta: e.target.value })} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20" placeholder="e.g., Shop Now, Learn More" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Additional Instructions</label>
                <textarea value={formData.user_prompt} onChange={(e) => setFormData({ ...formData, user_prompt: e.target.value })} rows={3} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20 resize-none" placeholder="Any specific requirements or notes..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Preferred Media</label>
                <div className="flex gap-3">
                  {['image', 'video', 'none'].map((media) => (
                    <button key={media} type="button" onClick={() => setFormData({ ...formData, preferred_media: media })} className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${formData.preferred_media === media ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-cream-200 text-navy-600 hover:border-cream-300'}`}>
                      {media === 'image' && <Image className="w-5 h-5" />}
                      {media === 'video' && <Video className="w-5 h-5" />}
                      {media}
                    </button>
                  ))}
                </div>
              </div>

              {formData.preferred_media !== 'none' && formData.preferred_media && (
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-2">
                    {formData.preferred_media === 'image' ? 'Image URL' : 'Video URL'}
                  </label>
                  <input type="url" value={formData.preferred_media === 'image' ? formData.user_image_url : formData.user_video_url}
                    onChange={(e) => setFormData({ ...formData, [formData.preferred_media === 'image' ? 'user_image_url' : 'user_video_url']: e.target.value })}
                    className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20"
                    placeholder={`Enter ${formData.preferred_media} URL`} />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-2">Media Instructions</label>
                <input type="text" value={formData.media_instructions} onChange={(e) => setFormData({ ...formData, media_instructions: e.target.value })} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-accent-500/20" placeholder="Instructions for AI media generation..." />
              </div>

              {formData.mode === 'schedule' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-2">Publish Date</label>
                    <input type="date" value={formData.publish_date} onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-2">Publish Time</label>
                    <input type="time" value={formData.publish_time} onChange={(e) => setFormData({ ...formData, publish_time: e.target.value })} className="w-full bg-cream-50 border-2 border-cream-200 focus:border-accent-500 rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowCreateModal(false); setEditingContent(null); resetForm() }} className="flex-1 py-3 border-2 border-cream-200 text-navy-700 font-semibold rounded-xl hover:bg-cream-50 transition-all">Cancel</button>
                <button type="submit" disabled={saving || formData.platforms.length === 0} className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingContent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} type={modal.type} title={modal.title} message={modal.message} />
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} type="warning" title="Delete Content?" message="This action cannot be undone. Are you sure?" confirmText="Delete" cancelText="Cancel" onConfirm={handleDelete} />
    </>
  )
}
