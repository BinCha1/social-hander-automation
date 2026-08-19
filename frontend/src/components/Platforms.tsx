import { motion } from 'framer-motion'
import { Zap, Facebook, Instagram, Linkedin, Twitter, Building, Calendar, Users, BarChart3, MessageSquare } from 'lucide-react'

const platforms = [
  { name: 'Facebook', icon: Facebook },
  { name: 'Instagram', icon: Instagram },
  { name: 'LinkedIn', icon: Linkedin },
  { name: 'Threads', icon: Twitter },
]

const brandProfiles = [
  {
    icon: Building,
    title: 'Business Profile',
    description: 'Brand name, industry, tone, style, products, and target audience all in one place.',
  },
  {
    icon: MessageSquare,
    title: 'AI Content Generation',
    description: 'Topic, goal, call-to-action, preferred media type - AI handles the rest.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Schedule for optimal times or trigger instant publishing with approval.',
  },
  {
    icon: Users,
    title: 'Multi-Account Management',
    description: 'Connect and manage multiple social accounts from a single dashboard.',
  },
  {
    icon: BarChart3,
    title: 'Campaign Analytics',
    description: 'Track performance across all platforms with unified analytics.',
  },
  {
    icon: Zap,
    title: 'Instant Approval',
    description: 'Review in Discord, approve with one click, publish everywhere.',
  },
]

export default function Platforms() {
  return (
    <section className="section-padding bg-cream-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent-500/5 rounded-full blur-[128px]" />
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">
            Connected Platforms
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-navy-950">
            One platform.
            <span className="text-accent-600"> Four channels.</span>
          </h2>
          <p className="text-navy-600 text-lg max-w-2xl mx-auto">
            Connect all your social accounts and publish to multiple platforms from a single content approval flow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="w-32 h-32 rounded-2xl bg-white border border-cream-200 flex flex-col items-center justify-center gap-3 hover:scale-105 hover:border-accent-500/50 transition-all duration-300 cursor-pointer group"
            >
              <platform.icon className="w-10 h-10 text-navy-700 group-hover:text-accent-600 transition-colors" />
              <span className="text-sm font-medium text-navy-700 group-hover:text-accent-600 transition-colors">
                {platform.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-cream-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-navy-950">
                Your brand,
                <span className="text-accent-600"> everywhere</span>
              </h3>
              <p className="text-navy-600 mb-6 leading-relaxed">
                Set up your business profile once, and PostFlow ensures every piece of content 
                maintains your brand consistency across all platforms.
              </p>
              <div className="space-y-4">
                {brandProfiles.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-navy-950 mb-0.5 flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-accent-600 md:hidden" />
                        {item.title}
                      </h4>
                      <p className="text-sm text-navy-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {brandProfiles.slice(3).map((item, i) => (
                <div key={i} className="bg-cream-50 rounded-xl p-4 border border-cream-200">
                  <item.icon className="w-6 h-6 text-accent-600 mb-3" />
                  <h4 className="font-medium text-navy-950 mb-1 text-sm">{item.title}</h4>
                  <p className="text-xs text-navy-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
