import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Search, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md bg-rose-600 flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                  </div>
                  <span className="ml-2 text-lg font-semibold text-gray-900">CHC</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/">
                <a className="text-gray-700 hover:text-rose-600 px-3 py-2 text-sm font-medium">Home</a>
              </Link>
              <Link href="/blogs">
                <a className="text-rose-600 border-b-2 border-rose-600 px-3 py-2 text-sm font-medium">Blog</a>
              </Link>
              <Link href="/about">
                <a className="text-gray-700 hover:text-rose-600 px-3 py-2 text-sm font-medium">About</a>
              </Link>
              <Link href="/contact">
                <a className="text-gray-700 hover:text-rose-600 px-3 py-2 text-sm font-medium">Contact</a>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center border-b pb-4">
                      <Link href="/">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-rose-600 flex items-center justify-center">
                            <span className="text-white font-bold">C</span>
                          </div>
                          <span className="ml-2 text-lg font-semibold text-gray-900">CHC</span>
                        </div>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <nav className="flex flex-col space-y-4 mt-6">
                      <Link href="/">
                        <a className="text-gray-700 hover:text-rose-600 py-2 text-base font-medium">Home</a>
                      </Link>
                      <Link href="/blogs">
                        <a className="text-rose-600 py-2 text-base font-medium">Blog</a>
                      </Link>
                      <Link href="/about">
                        <a className="text-gray-700 hover:text-rose-600 py-2 text-base font-medium">About</a>
                      </Link>
                      <Link href="/contact">
                        <a className="text-gray-700 hover:text-rose-600 py-2 text-base font-medium">Contact</a>
                      </Link>
                    </nav>
                    <div className="mt-auto pt-6 border-t">
                      <div className="flex flex-col space-y-3">
                        <Link href="/auth/login">
                          <Button variant="outline" className="w-full">Sign in</Button>
                        </Link>
                        <Link href="/auth/register">
                          <Button className="w-full bg-rose-600 hover:bg-rose-700">Sign up</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop login/register */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-rose-600 hover:bg-rose-700">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-rose-600 flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="ml-2 text-lg font-semibold">CHC</span>
              </div>
              <p className="mt-2 text-sm text-gray-400 max-w-xs">
                A professional blogging platform for sharing knowledge, insights, and ideas with the world.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Navigation</h3>
              <ul className="space-y-3">
                <li><Link href="/"><a className="text-gray-400 hover:text-white transition">Home</a></Link></li>
                <li><Link href="/blogs"><a className="text-gray-400 hover:text-white transition">Blog</a></Link></li>
                <li><Link href="/about"><a className="text-gray-400 hover:text-white transition">About</a></Link></li>
                <li><Link href="/contact"><a className="text-gray-400 hover:text-white transition">Contact</a></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy"><a className="text-gray-400 hover:text-white transition">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="text-gray-400 hover:text-white transition">Terms of Service</a></Link></li>
                <li><Link href="/faq"><a className="text-gray-400 hover:text-white transition">FAQ</a></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm-1 14H9V9h2v7zm-1-8.75A1.25 1.25 0 1111.25 8 1.25 1.25 0 0110 6.75zM17 16h-2v-4c0-.97-.67-1.75-1.5-1.75S12 11.03 12 12v4h-2V9h2v1c.52-.63 1.2-1 2-1 1.66 0 3 1.34 3 3v4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Subscribe to our newsletter</h3>
                <form className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="min-w-0 bg-white border border-gray-300 rounded-l-md py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 flex-1"
                  />
                  <Button type="submit" className="-ml-px relative inline-flex items-center space-x-2 rounded-l-none rounded-r-md bg-rose-600 hover:bg-rose-700">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400 text-center">© 2023 CHC, Rishihood University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;