import React from "react";
import Link from "next/link";
import DecryptedText from "./DecryptedText";

const Footer = () => {
  return (
    <footer className="relative bg-black text-white py-6 lg:px-8 px-4 mt-auto z-[999]">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-medium mb-4">Get in Touch</h2>
        <p className="mb-4 font-thin">
          I would love to hear from you! Feel free to reach out.
        </p>
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/archive" className="hover:text-gray-300 ease-linear">
            <DecryptedText
              animateOn="hover"
              text="■ Works Archive"
              speed={50}
              maxIterations={10}
              sequential={true}
              revealDirection="left"
            />
          </Link>
          <Link href="/about" className="hover:text-gray-300 ease-linear">
            <DecryptedText
              animateOn="hover"
              text="■ About"
              speed={50}
              maxIterations={10}
              sequential={true}
              revealDirection="left"
            />
          </Link>
          <a
            href="mailto:josh4work0224@gmail.com"
            className="hover:text-gray-300 ease-linear"
          >
            <DecryptedText
              animateOn="hover"
              text="■ Let's talk"
              speed={50}
              maxIterations={10}
              sequential={true}
              revealDirection="left"
            />
          </a>
        </div>
        <div className="flex justify-center space-x-4">
          <a
            href="https://linkedin.com/in/sheng-chi-huang-9600371a7"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8a6 6 0 00-6 6v8h-4v-8a10 10 0 1120 0v8h-4v-8a6 6 0 00-6-6z"
              />
            </svg>
          </a>
          {/* Add more social links as needed */}
        </div>
        <p className="mt-4 text-sm">
          &copy; {new Date().getFullYear()} Huang Sheng-Chi. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
