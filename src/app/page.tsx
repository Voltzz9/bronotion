import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            CollabNotes
          </Link>
          <div className="space-x-4">
            <Link href="/features" className="text-gray-600 hover:text-blue-600">Features</Link>
            <Link href="/login" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Login</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Collaborate on Notes in Real-Time</h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, share, and edit notes with your team - all in one place.
            </p>
            <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
              Get Started for Free
            </Link>
            <div className="mt-8">
              <Link href="/notes" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
                Continue without Signing In
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 custom">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose CollabNotes?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
                <p className="text-white-600">Work together with your team in real-time, seeing changes as they happen.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Secure and Private</h3>
                <p className="text-white-600">Your notes are encrypted and only accessible to those you choose to share with.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">Access Anywhere</h3>
                <p className="text-white-600">Use CollabNotes on any device, with our web and mobile apps.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start collaborating?</h2>
            <p className="text-xl mb-8">Join thousands of teams already using CollabNotes to work better together.</p>
            <Link href="/signup" className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100">
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-blue-400">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-400">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-blue-400">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-blue-400">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-blue-400">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-blue-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="hover:text-blue-400">Blog</Link></li>
                <li><Link href="/help" className="hover:text-blue-400">Help Center</Link></li>
                <li><Link href="/api" className="hover:text-blue-400">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; 2023 CollabNotes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}