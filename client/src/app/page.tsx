import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Header from '@/components/ui/header'
import { CarouselLandingComponent } from '../components/carousel-landing'
import { TextAnimate } from "@/components/ui/text-animate"
import { SessionWrapper } from './SessionProvider'

export default function HomePage() {
  return (
    <SessionWrapper>
      <div className="min-h-screen flex flex-col relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-40 mt-10 -z-10 m-auto h-[310px] w-120px rounded-full bg-fuchsia-400 opacity-40 blur-[100px]"></div>
        </div>
        <Header />
        <main className="flex-grow relative">
          <div className="relative z-10">
            <section className="py-60">
              <div className="container mx-auto px-4 text-center">
                <TextAnimate text="Real-Time note collaboration" type="rollIn" />
                <p className="text-xl mb-8 text-secondary">
                  Create, share, and edit notes with your team - all in one place.
                </p>
                <Link href="/home">
                  <Button>
                    Try it out!
                  </Button>
                </Link>
              </div>
            </section>
          </div>

          <CarouselLandingComponent />

          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-secondary mb-4">Ready to start collaborating?</h2>
              <p className="text-xl mb-8">Join thousands of teams already using Bronotion to work better together.</p>
              <Link
                href={'/auth/signin'}
                className="bg-secondary text-background px-6 py-3 rounded-lg text-lg font-semibold hover:bg-secondary/90 transition-colors"
              >
                Sign Up Now
              </Link>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">About Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
                  <p className="text-muted-foreground">Work together seamlessly with your team in real-time.</p>
                </div>
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Customizable Workflows</h3>
                  <p className="text-muted-foreground">Tailor Bronotion to fit your team&rsquo;s unique needs.</p>
                </div>
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                  <p className="text-muted-foreground">Your data is protected with enterprise-grade security.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-8 text-center bg-purple-300">
          <div className="container mx-auto foreground px-4">
            <p>&copy; 2024 Bronotion. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </SessionWrapper>
  );
}