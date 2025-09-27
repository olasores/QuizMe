"use client";

import Link from "next/link";
import { useState } from "react";

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="relative bg-white shadow-md border-b border-black">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* <Image src="/next.svg" alt="Logo" width={40} height={40} className="w-10 h-10 filter grayscale" /> */}
          <span className="text-xl sm:text-2xl font-bold text-black">QuizMe</span>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6 text-lg font-medium">
          <li>
            <Link href="/" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">Home</Link>
          </li>
          <li>
            <Link href="/about" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">About</Link>
          </li>
          <li>
            <Link href="/faq" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">FAQ</Link>
          </li>
          <li>
            <Link href="/login" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">Log In</Link>
          </li>
          <li>
            <Link href="/signup" className="text-black hover:text-white hover:bg-black px-3 py-1 rounded transition-colors">Sign Up</Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <ul className="bg-white border-t border-gray-200 py-2">
          <li>
            <Link 
              href="/" 
              className="block text-black hover:bg-gray-100 px-6 py-3 text-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/about" 
              className="block text-black hover:bg-gray-100 px-6 py-3 text-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              href="/faq" 
              className="block text-black hover:bg-gray-100 px-6 py-3 text-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
          </li>
          <li>
            <Link 
              href="/login" 
              className="block text-black hover:bg-gray-100 px-6 py-3 text-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Log In
            </Link>
          </li>
          <li>
            <Link 
              href="/signup" 
              className="block text-black hover:bg-gray-100 px-6 py-3 text-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;