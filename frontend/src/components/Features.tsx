import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Shield, Clock, Globe, Rocket } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Content',
    description: 'Generate engaging content with AI that matches your brand voice and resonates with your audience.',
  },
  {
    icon: MessageSquare,
    title: 'Discord Approval',
    description: 'Review and approve generated content in Discord before it goes live. Full control, zero friction.',
  },
  {
    icon: Shield,
    title: 'Secure Credentials',
    description: 'All social media tokens encrypted at rest. Enterprise-grade security for your brand assets.',
  },
  {
    icon: Clock,
    title: 'Schedule & Automate',
    description: 'Set it and forget it. Schedule content weeks ahead or trigger instant publishing.',
  },
  {
    icon: Globe,
    title: 'Multi-Platform',
    description: 'Publish to Facebook, Instagram, LinkedIn, and Threads from a single dashboard.',
  },
  {
    icon: Rocket,
    title: 'One-Click Publish',
    description: 'Approved content goes live instantly across all connected platforms with one click.',
  },
]

export default function Features() {
  return (
    <section id="features" className="section-padding bg-cream-50 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-navy-950">
            Everything you need to
            <span className="text-accent-600"> dominate social</span>
          </h2>
          <p className="text-navy-600 text-lg max-w-2xl mx-auto">
            Powerful features designed to streamline your content workflow and maximize engagement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-cream-200 hover:border-accent-500/30 transition-all duration-300 group"
            >
              <h3 className="font-display text-2xl font-semibold mb-3 text-navy-950 group-hover:text-accent-600 transition-colors flex items-center gap-3">
                <feature.icon className="w-6 h-6 text-accent-600 flex-shrink-0" />
                {feature.title}
              </h3>
              <p className="text-navy-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
