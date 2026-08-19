import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "PostFlow cut our social media publishing time by 80%. The Discord approval workflow is genius - our team loves it.",
    author: "Sarah Chen",
    role: "Marketing Director, TechFlow",
    avatar: "SC",
  },
  {
    quote: "Finally, a tool that understands brand consistency. PostFlow maintains our voice across all platforms without the headache.",
    author: "Marcus Johnson",
    role: "CEO, BrandFirst Agency",
    avatar: "MJ",
  },
  {
    quote: "The AI content generation is surprisingly good. It actually understands our industry terminology and audience.",
    author: "Emily Rodriguez",
    role: "Social Media Manager, GrowthLab",
    avatar: "ER",
  },
  {
    quote: "We manage 12 brands across 4 platforms. PostFlow makes what used to be a full-time job manageable for one person.",
    author: "David Kim",
    role: "Founder, ScaleUp Media",
    avatar: "DK",
  },
]

export default function Testimonials() {
  return (
    <section className="section-padding bg-cream-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[128px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[128px] -translate-y-1/2" />
      </div>
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-navy-950">
            Loved by
            <span className="text-accent-600"> marketing teams</span>
          </h2>
          <p className="text-navy-600 text-lg max-w-2xl mx-auto">
            Join thousands of brands already automating their social media with PostFlow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-cream-200 hover:border-accent-500/30 transition-all"
            >
              <Quote className="w-8 h-8 text-accent-600 mb-4" />
              <p className="text-navy-700 text-lg leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-navy-950">{testimonial.author}</div>
                  <div className="text-sm text-navy-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
