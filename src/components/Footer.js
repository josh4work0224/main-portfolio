import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="relative bg-black text-white py-6 lg:px-8 px-4 mt-auto z-[999]">
      <div className="container mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
        <p className="mb-4">I would love to hear from you! Feel free to reach out.</p>
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/archive" className="hover:text-gray-300 ease-linear">■ Works Archive</Link>
          <Link href="/about" className="hover:text-gray-300 ease-linear">■ About</Link>
          <a href="mailto:josh4work0224@gmail.com" className="hover:text-gray-300 ease-linear">■ Let&apos;s talk</a>
        </div>
        <div className="flex justify-center space-x-4">
          <a href="https://linkedin.com/in/sheng-chi-huang-9600371a7" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 00-6 6v8h-4v-8a10 10 0 1120 0v8h-4v-8a6 6 0 00-6-6z" />
            </svg>
          </a>
          {/* Add more social links as needed */}
        </div>
        <p className="mt-4 text-sm">&copy; {new Date().getFullYear()} Huang Sheng-Chi. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;