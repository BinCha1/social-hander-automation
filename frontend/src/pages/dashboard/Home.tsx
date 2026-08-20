import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Globe,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'

export default function DashboardHome() {
  const [loading, setLoading] = useState(true)
  const [contents, setContents] = useState([])
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0, processing: 0, failed: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/content', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const items = data.items || []
        setContents(items.slice(0, 5))

        const total = items.length
        const done = items.filter(c => c.status === 'done').length
        const pending = items.filter(c => c.status === 'pending').length
        const processing = items.filter(c => c.status === 'processing').length
        const failed = items.filter(c => c.status === 'failed').length

        setStats({ total, done, pending, processing, failed })
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    { icon: FileText, label: 'Total Content', value: stats.total, trend: 'up', change: '' },
    { icon: CheckCircle, label: 'Published', value: stats.done, trend: 'up', change: '' },
    { icon: Clock, label: 'Scheduled', value: stats.pending, trend: 'up', change: '' },
    { icon: AlertCircle, label: 'Processing', value: stats.processing, trend: 'up', change: '' },
  ]

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    done: 'bg-accent-100 text-accent-700',
    failed: 'bg-red-100 text-red-700',
  }

  const platformColors = {
    instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    facebook: 'bg-blue-600',
    linkedin: 'bg-blue-700',
    threads: 'bg-orange-500',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
      </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-accent-600" />
                </div>
                <TrendingUp className={`w-4 h-4 text-accent-600`} />
              </div>
              <h3 className="text-3xl font-bold text-navy-950">{stat.value}</h3>
              <p className="text-navy-500 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-navy-950">Recent Content</h2>
              <button onClick={() => navigate('/dashboard/content')} className="text-accent-600 hover:text-accent-700 text-sm font-medium flex items-center gap-1">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            {contents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                <p className="text-navy-500">No content yet</p>
                <button onClick={() => navigate('/dashboard/content')} className="mt-3 text-accent-600 hover:underline font-medium">
                  Create your first content
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {contents.map((content, i) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy-950 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-navy-950 truncate">{content.topic || 'Untitled'}</h4>
                      <p className="text-sm text-navy-500">{(content.platforms || []).join(', ')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[content.status] || 'bg-gray-100 text-gray-700'}`}>
                      {content.status || 'pending'}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
            <h2 className="font-display text-xl font-bold text-navy-950 mb-6">Content by Platform</h2>
            {contents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-navy-500 text-sm">No platform data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {['instagram', 'facebook', 'linkedin', 'threads'].map((platform) => {
                  const count = contents.filter(c => (c.platforms || []).includes(platform)).length
                  const maxCount = Math.max(...['instagram', 'facebook', 'linkedin', 'threads'].map(p => contents.filter(c => (c.platforms || []).includes(p)).length), 1)
                  return (
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-lg ${platformColors[platform]} flex items-center justify-center flex-shrink-0`}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-navy-950 capitalize">{platform}</span>
                          <span className="text-sm text-navy-500">{count} posts</span>
                        </div>
                        <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / maxCount) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${platformColors[platform]}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
