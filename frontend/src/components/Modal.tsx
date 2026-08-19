import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

export default function Modal({ isOpen, onClose, type = 'info', title, message, confirmText = 'OK', cancelText, onConfirm }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'text-accent-600 bg-accent-100',
    error: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100',
  }

  const buttonColors = {
    success: 'bg-accent-500 hover:bg-accent-600',
    error: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  }

  const Icon = icons[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full ${colors[type]} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  {title && <h3 className="font-display text-xl font-bold text-navy-950 mb-2">{title}</h3>}
                  <p className="text-navy-600">{message}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-4 bg-cream-50 border-t border-cream-200">
              {cancelText && (
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-cream-200 text-navy-700 font-semibold hover:bg-cream-100 transition-all"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={onConfirm || onClose}
                className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold transition-all ${buttonColors[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Alert({ isOpen, onClose, title, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      type="info"
      title={title}
      message={message}
    />
  )
}

export function Confirm({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      type="warning"
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
    />
  )
}
