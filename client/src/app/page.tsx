import Link from 'next/link'
import { Button } from '@/components/ui/button'
import  Header  from '@/components/ui/header'
import { CarouselLandingComponent } from '../components/carousel-landing'
import { TextAnimate } from "@/components/ui/text-animate"
import { SessionWrapper } from './SessionProvider'

export default function HomePage() {
  return (
    <SessionWrapper>
    <div className="min-h-screen flex flex-col bg-primary text-foreground">
       <Header />
      <main className="flex-grow pt-20">
        <section className="bg-muted py-60">
            <div className="container mx-auto px-4 text-center">
                <TextAnimate text="Real-Time note collaboration" type="rollIn" />
              <p className="text-xl mb-8 text-secondary">
                Create, share, and edit notes with your team - all in one place.
              </p>
              <Link href="/notes/1">
                <Button>
                  Try it out!
                </Button>
              </Link>
            </div>
          </section>

        
      </main>

      <CarouselLandingComponent /> 

      <section className="bg-accent text-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start collaborating?</h2>
            <p className="text-xl mb-8">Join thousands of teams already using CollabNotes to work better together.</p>
            <Link 
              href={{
              pathname: '/login',
              query: {mode: 'signup'}
              }} 
              className="bg-primary text-background hover:bg-secondary px-6 py-3 rounded-lg text-lg font-semibold"
            >
              Sign Up Now
            </Link>
          </div>
        </section>

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
            <p>&copy; 2024 Bronotion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </SessionWrapper>
  );
}