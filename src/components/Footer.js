import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="relative bg-black text-white py-6 lg:px-8 px-4 mt-auto z-[999]">
      <div className="container mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
        <p className="mb-4">I would love to hear from you! Feel free to reach out.</p>
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/contact" className="hover:text-gray-300">Contact</Link>
          <Link href="/about" className="hover:text-gray-300">About</Link>
          <Link href="/archive" className="hover:text-gray-300">Works Archive</Link>
        </div>
        <div className="flex justify-center space-x-4">
          <a href="https://twitter.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14.86A4.48 4.48 0 0022 1.54a9.1 9.1 0 01-2.87 1.1A4.48 4.48 0 0016.16 0c-2.48 0-4.48 2-4.48 4.48 0 .35.04.69.1 1.02A12.74 12.74 0 011.67 1.15a4.48 4.48 0 001.39 6.01A4.48 4.48 0 01.9 7.5v.06a4.48 4.48 0 003.58 4.39 4.48 4.48 0 01-2.02.08 4.48 4.48 0 004.18 3.1A9.05 9.05 0 010 19.54a12.74 12.74 0 006.9 2.02c8.27 0 12.78-6.85 12.78-12.78 0-.2 0-.39-.01-.58A9.12 9.12 0 0023 3z" />
            </svg>
          </a>
          <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 00-6 6v8h-4v-8a10 10 0 1120 0v8h-4v-8a6 6 0 00-6-6z" />
            </svg>
          </a>
          {/* Add more social links as needed */}
        </div>
        <p className="mt-4 text-sm">&copy; {new Date().getFullYear()} Your Name. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;