"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaLongArrowAltRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Adjust the path based on your folder structure

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMainPage = pathname === "/";
  const isSmallScreen = useMediaQuery("(max-width: 767px)");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !event.target.closest(".navbar")) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // 🧠 Conditional rendering: hide navbar on non-main pages if screen is not small
  if (!isMainPage && !isSmallScreen) {
    return null;
  }

  return (
    <nav className="navbar bg-gradient-to-r from-white to-[#FF685B] p-4 w-full mx-auto fixed top-0 inset-x-0 z-50 flex justify-between items-center shadow-lg">
      <Link href="/" className="text-lg font-semibold text-black">
        DocConnect
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-x-2">
        {isMainPage && (
          <>
            <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20" asChild>
              <Link href="/">Product</Link>
            </Button>
            <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20" asChild>
              <Link href="/">Pricing</Link>
            </Button>
            <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20" asChild>
              <Link href="/">Contact</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-[#FF685B] font-semibold hover:bg-white/90 transition-all duration-200" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button variant="ghost" size="sm" className="bg-[#FF685B] font-semibold text-white hover:bg-[#FF685B]/80 transition-all duration-200 flex items-center gap-2" asChild>
              <Link href="/auth/register">
                Join us <FaLongArrowAltRight className="w-5 h-5" />
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-black focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && isMainPage && (
        <div className="absolute opacity-95 top-full left-0 w-full bg-white/90 backdrop-blur-sm rounded-b-lg shadow-lg p-4 flex flex-col items-start gap-y-4 md:hidden transition-all duration-300 ease-in-out">
          <Button variant="ghost" className="font-semibold text-black w-full text-left" asChild>
            <Link href="/" onClick={closeMenu}>Home</Link>
          </Button>
          <Button variant="ghost" className="font-semibold text-black w-full text-left" asChild>
            <Link href="/" onClick={closeMenu}>Products</Link>
          </Button>
          <Button variant="ghost" className="font-semibold text-black w-full text-left" asChild>
            <Link href="/" onClick={closeMenu}>Pricing</Link>
          </Button>
          <Button variant="ghost" className="font-semibold text-black w-full text-left" asChild>
            <Link href="/" onClick={closeMenu}>Contact</Link>
          </Button>
          <Button variant="ghost" className="text-[#FF685B] font-semibold hover:bg-white/90 w-full text-left" asChild>
            <Link href="/auth/login" onClick={closeMenu}>Login</Link>
          </Button>
          <Button variant="ghost" className="bg-[#FF685B] font-semibold text-white hover:bg-[#FF685B]/80 w-full text-left flex items-center gap-2" asChild>
            <Link href="/auth/register" onClick={closeMenu}>
              Join us <FaLongArrowAltRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
