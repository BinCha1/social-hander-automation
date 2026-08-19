import { Link } from 'react-router-dom'
import { Zap, Github, Twitter, Linkedin, MessageSquare } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#' },
  ],
  Resources: [
    { name: 'Documentation', href: '#' },
    { name: 'Help Center', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Templates', href: '#' },
  ],
  Legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Security', href: '#' },
    { name: 'Cookies', href: '#' },
  ],
}

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'GitHub', icon: Github, href: '#' },
  { name: 'Discord', icon: MessageSquare, href: 'https://discord.gg/6vxEXNjWtD' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800">
      <div className="container-custom py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="font-display font-bold text-xl text-cream-50">
                Post<span className="text-accent-500">Flow</span>
              </span>
            </Link>
            <p className="text-cream-200 text-sm mb-6 max-w-xs">
              Automate your reach. Elevate your brand. AI-powered social media automation that actually works.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => {
                const Icon = social.icon
                return (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-navy-800 hover:bg-accent-500 flex items-center justify-center text-cream-100 hover:text-white transition-all duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-cream-50 mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-cream-200 hover:text-accent-500 text-sm transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream-200 text-sm">
            © 2026 PostFlow. All rights reserved.
          </p>
          <p className="text-cream-200 text-sm">
            A product by{' '}
            <a
              href="https://elevate-x.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-500 hover:text-accent-400 transition-colors"
            >
              Elevate-X
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
