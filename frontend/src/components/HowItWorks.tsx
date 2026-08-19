import { motion } from 'framer-motion'
import { MessageSquare, Bot, CheckCircle, Globe } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Bot,
    title: 'AI Generates Content',
    description: 'Our AI analyzes your brand, audience, and goals to create engaging posts tailored for each platform.',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Review in Discord',
    description: 'Generated content is sent to your Discord channel. Review, edit, or approve with one click.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Approve & Publish',
    description: 'Hit approve and watch your content go live across all connected social platforms instantly.',
  },
  {
    number: '04',
    icon: Globe,
    title: 'Multi-Platform Reach',
    description: 'Your message reaches audiences on Facebook, Instagram, LinkedIn, and Threads simultaneously.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-cream-50 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-navy-950">
            From idea to
            <span className="text-accent-600"> viral in minutes</span>
          </h2>
          <p className="text-navy-600 text-lg max-w-2xl mx-auto">
            A simple four-step process that transforms how you create and distribute social content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-white text-center group rounded-2xl p-6 border border-cream-200"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-mono text-accent-600 mb-2">{step.number}</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-navy-950">
                {step.title}
              </h3>
              <p className="text-navy-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
