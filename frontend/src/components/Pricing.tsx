import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started with social automation.',
    features: [
      '5 content requests/month',
      '1 social account per platform',
      'Discord approval workflow',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing brands that need more reach.',
    features: [
      '50 content requests/month',
      '5 social accounts per platform',
      'Priority AI generation',
      'Advanced analytics',
      'Custom scheduling',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For teams and agencies managing multiple brands.',
    features: [
      'Unlimited content requests',
      'Unlimited social accounts',
      'Team collaboration',
      'White-label reports',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-cream-50 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-primary mb-4 inline-block">
            Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-navy-950">
            Simple, transparent
            <span className="text-accent-600"> pricing</span>
          </h2>
          <p className="text-navy-600 text-lg max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-accent-500 scale-105'
                  : 'bg-white border border-cream-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-navy-950 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-navy-950 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-navy-950">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-navy-600">{plan.period}</span>
                  )}
                </div>
                <p className="text-navy-600 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-accent-600'} flex-shrink-0 mt-0.5`} />
                    <span className={plan.popular ? 'text-white/90' : 'text-navy-700'} text-sm>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-navy-950 hover:bg-navy-900 text-white'
                    : 'bg-accent-500 hover:bg-accent-600 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-navy-600 mt-12"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
