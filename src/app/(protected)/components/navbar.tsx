"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

const NotificationButton = () => (
  <Button variant="ghost" size="sm">
    🔔
  </Button>
)
const UserButton = () => (
  <Button variant="ghost" size="sm">
    👤
  </Button>
)
const ModeToggle = () => (
  <Button variant="ghost" size="sm">
    🌙
  </Button>
)
const LoginButton = ({ children, mode }: { children: React.ReactNode; mode: string }) => children
const RegisterButton = ({ children, mode }: { children: React.ReactNode; mode: string }) => children

export const Navbar = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const isMainPage = pathname === "/"

  const links = [
    { href: "/user", label: "Dashboard" },
    { href: "/appointment", label: "Book an Appointment" },
    { href: "/lab", label: "Book a Lab Test" },
    { href: "/settings", label: "Settings" },
    { href: "/meeting", label: "Meeting" },
  ]

  return (
    <>
        {/* <Link href="/" className="text-lg font-semibold text-black">
          DocConnect
        </Link> */}

        <div className="hidden md:flex gap-x-2">
          {/* {pathname !== "/" && (
            <>
              <NotificationButton />
              {links.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant="ghost"
                  className={`font-semibold transition-all duration-200 ${
                    pathname === link.href ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </>
          )} */}

{/* <nav className="bg-gradient-to-r from-[#FFFFFF] to-[#FF685B] p-4 w-full mx-auto fixed top-0 inset-x-0 z-50 flex justify-between items-center shadow-lg"> */}
          {isMainPage && (
            <>
              <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20">
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20">
                <Link href="/">Product</Link>
              </Button>
              <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20">
                <Link href="/">Pricing</Link>
              </Button>
              <Button variant="ghost" size="sm" className="font-semibold text-black hover:bg-white/20">
                <Link href="/">Contact</Link>
              </Button>
              <LoginButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#FF685B] font-semibold hover:bg-[#FFFFFF]/90 transition-all duration-200"
                >
                  Login
                </Button>
              </LoginButton>
              <RegisterButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-[#FF685B] font-semibold text-white hover:bg-[#FF685B]/80 transition-all duration-200 flex items-center gap-2"
                >
                  Join us <FaLongArrowAltRight />
                </Button>
              </RegisterButton>
            </>
          )}
        </div>

        
        {/* <div className="hidden md:flex items-center gap-4">
          {!isMainPage && <UserButton />}
          <ModeToggle />
        </div> */}

        {/* Hamburger Icon for Mobile */}
        {/* <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle menu" className="text-black">
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div> */}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute opacity-95 top-full left-0 w-full bg-white/90 backdrop-blur-sm rounded-b-lg shadow-lg p-4 flex flex-row flex-wrap items-center gap-y-4 md:hidden transition-all duration-300 ease-in-out">
            {!isMainPage && (
              <>
                {links.map((link) => (
                  <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    className={`font-semibold ${
                      pathname === link.href ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    <Link href={link.href} onClick={() => setIsMenuOpen(false)}>
                      {link.label}
                    </Link>
                  </Button>
                ))}
                <LoginButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-[#FF685B] font-semibold hover:bg-[#FFFFFF]/90">
                    Login
                  </Button>
                </LoginButton>
                <RegisterButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-[#FF685B] font-semibold text-white hover:bg-[#FFFFFF]/90"
                  >
                    Join us
                  </Button>
                </RegisterButton>
              </>
            )}
            {isMainPage && (
              <>
                <Button asChild variant="ghost" className="font-semibold text-black">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="font-semibold text-black">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    Products
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="font-semibold text-black">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    Pricing
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="font-semibold text-black">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    Contact
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="text-[#FF685B] font-semibold hover:bg-[#FFFFFF]/90">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="bg-[#FF685B] font-semibold text-white hover:bg-[#FFFFFF]/90 flex items-center gap-2"
                >
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                    Join us <FaLongArrowAltRight />
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      {/* </nav>  */}
      {/* <div className="mt-20"></div> */}
    </>
  )
}
