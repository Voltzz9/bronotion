import Link from 'next/link'
import { Button } from '@/components/ui/button'
import  Header  from '@/components/ui/header'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary text-foreground">
      
      <Header />

      <main className="flex-grow">
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4 text-secondary">Collaborate on Notes in Real-Time</h1>
            <p className="text-xl mb-8 text-secondary">
              Create, share, and edit notes with your team - all in one place.
            </p>
            <Link href="/notes">
              <Button>
              Get Started without signup
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose CollabNotes?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
          { icon: '🚀', title: 'Real-Time Collaboration', description: 'Work together with your team in real-time, seeing changes as they happen.', bgColor: 'bg-secondary' },
          { icon: '🔒', title: 'Secure and Private', description: 'Your notes are encrypted and only accessible to those you choose to share with.', bgColor: 'bg-primary' },
          { icon: '📱', title: 'Access Anywhere', description: 'Use CollabNotes on any device, with our web and mobile apps.', bgColor: 'bg-highlight' }
              ].map((feature, index) => (
          <div key={index} className={`text-center p-6 rounded-lg shadow-sm ${feature.bgColor}`}>
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-primary">{feature.title}</h3>
            <p className="text-foreground">{feature.description}</p>
          </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-accent text-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start collaborating?</h2>
            <p className="text-xl mb-8">Join thousands of teams already using CollabNotes to work better together.</p>
            <Link href="/signup" className="bg-primary text-background hover:bg-secondary px-6 py-3 rounded-lg text-lg font-semibold">
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-muted text-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Product', links: [
                { href: '/features', text: 'Features' },
                { href: '/pricing', text: 'Pricing' },
                { href: '/security', text: 'Security' }
              ]},
              { title: 'Company', links: [
                { href: '/about', text: 'About Us' },
                { href: '/careers', text: 'Careers' },
                { href: '/contact', text: 'Contact' }
              ]},
              { title: 'Resources', links: [
                { href: '/blog', text: 'Blog' },
                { href: '/help', text: 'Help Center' },
                { href: '/api', text: 'API Docs' }
              ]},
              { title: 'Legal', links: [
                { href: '/privacy', text: 'Privacy Policy' },
                { href: '/terms', text: 'Terms of Service' }
              ]}
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4 text-primary">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className="hover:text-primary">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-accent text-center">
            <p>&copy; 2023 CollabNotes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}