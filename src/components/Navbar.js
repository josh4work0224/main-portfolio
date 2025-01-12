import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuContentRef = useRef(null);

  useEffect(() => {
    if (isMenuOpen) {
      // Show the menu container first
      gsap.set(menuRef.current, {
        display: "flex",
      });

      // Animate menu sliding in
      gsap.fromTo(
        menuRef.current,
        {
          clipPath: "inset(0 0 0 100%)",
        },
        {
          clipPath: "inset(0 0 0 0%)",
          duration: 0.75,
          ease: "power4.inOut",
        }
      );

      // Animate menu items with stagger
      gsap.fromTo(
        menuContentRef.current.children,
        {
          x: 50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    } else {
      // Animate menu sliding out
      gsap.to(menuRef.current, {
        clipPath: "inset(0 0 0 100%)",
        duration: 0.75,
        ease: "power4.inOut",
        onComplete: () => {
          gsap.set(menuRef.current, {
            display: "none",
          });
        },
      });
    }
  }, [isMenuOpen]);

  return (
    <nav className="w-full fixed top-0 left-0 row-start-1 lg:grid lg:grid-cols-3 flex items-center justify-between py-4 md:px-8 px-4 z-[999] gap-2">
      <span className="text-xl font-display lg:order-1 order-2 lg:col-span-1">
        <Link href="/" scroll={false}>
          <strong>SHENGCHI</strong> H.
        </Link>
      </span>

      <Link
        className="flex-1 flex lg:justify-center justify-start lg:order-2 order-1 lg:col-span-1"
        href="/"
        scroll={false}
      >
        <Image src="/assets/chi4logo.svg" alt="Logo" width={50} height={50} />
      </Link>

      {/* Hamburger button */}
      <button
        className="lg:hidden z-50 text-white order-3"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Desktop menu */}
      <div className="hidden lg:flex gap-6 order-3 lg:col-span-1 lg:justify-end">
        <Link href="/archive" className="hover:text-gray-300" scroll={false}>
          Works Archive
        </Link>
        <Link href="/about" className="hover:text-gray-300" scroll={false}>
          About
        </Link>
        <Link href="#" className="hover:text-gray-300" scroll={false}>
          Let&apos;s talk
        </Link>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className="lg:hidden fixed inset-0 bg-black/95 z-40 flex-col items-center justify-center hidden"
      >
        <div ref={menuContentRef} className="flex flex-col items-center gap-8">
          <Link
            href="/archive"
            className="text-white hover:text-gray-300 text-2xl"
          >
            Works Archive
          </Link>
          <Link
            href="/about"
            className="text-white hover:text-gray-300 text-2xl"
            scroll={false}
          >
            About
          </Link>
          <Link
            href="#"
            className="text-white hover:text-gray-300 text-2xl"
            scroll={false}
          >
            Let&apos;s talk
          </Link>
        </div>
      </div>
    </nav>
  );
}
