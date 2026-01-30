import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">About Quiz Practice</h3>
            <p className="text-sm text-zinc-600">
              An interactive learning platform for students to practice MCQs and improve their knowledge.
              Study smarter with timed quizzes and detailed analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-zinc-600 hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/upload"
                  className="text-sm text-zinc-600 hover:text-blue-600 transition-colors"
                >
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Information */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Developer</h3>
            <div className="space-y-2 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-900">Naeem</p>
              <p>Department of Computer Science and Engineering</p>
              <p>University of Barisal</p>
              <div className="mt-4 space-y-1">
                <a
                  href="tel:+8801623094662"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>01623094662</span>
                </a>
                <a
                  href="mailto:naeem.cse7.bu@gmail.com"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>naeem.cse7.bu@gmail.com</span>
                </a>
                <a
                  href="https://www.facebook.com/AreFin1Naeem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-zinc-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500 text-center sm:text-left">
              © {new Date().getFullYear()} Quiz Practice. All rights reserved.
            </p>
            <p className="text-xs text-zinc-500 text-center sm:text-right">
              Developed by <span className="font-semibold text-zinc-700">Naeem</span> - CSE, University of Barisal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
