"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";

import { FiMenu, FiX } from "react-icons/fi";
import { LoginButton } from "@/components/auth/login-button";
import { RegisterButton } from "@/components/auth/register-button";

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isMainPage = pathname === "/";

  return (
    <nav className="bg-secondary shadow-sm p-4 rounded-xl w-full max-w-[95%] mx-auto mt-2 fixed top-0 inset-x-0 z-50 flex justify-between items-center">
      <Link href="/" className="text-lg font-semibold">
        Logo
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-x-2">
        {pathname !== "/" && (
          <>
            <Button
              asChild
              variant={pathname === "/server" ? "default" : "outline"}
            >
              <Link href="/server">User Information</Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/settings" ? "default" : "outline"}
            >
              <Link href="/settings">Settings</Link>
            </Button>
          </>
        )}
        {isMainPage && (
          <>
            {/* Links for main page only */}
            <div>
              <LoginButton mode="modal" asChild>
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </LoginButton>
            </div>
            <div>
              <RegisterButton mode="modal" asChild>
                <Button variant="secondary" size="sm">
                  Register
                </Button>
              </RegisterButton>
            </div>
          </>
        )}
      </div>

      {/* User Controls */}
      <div className="hidden md:flex items-center gap-4">
        {!isMainPage && <UserButton />}
        <ModeToggle />
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="md:hidden">
        <button onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-secondary rounded-b-lg shadow-lg p-4 flex flex-col items-center gap-y-4 md:hidden">
          {!isMainPage && (
            <>
              <div>
                <LoginButton mode="modal" asChild>
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </LoginButton>
              </div>
              <div>
                <RegisterButton mode="modal" asChild>
                  <Button variant="secondary" size="sm">
                    Register
                  </Button>
                </RegisterButton>
              </div>
            </>
          )}
          {isMainPage && (
            <>
              <Button asChild variant="outline">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </Button>
            </>
          )}
          {isMainPage && <UserButton />}
          <ModeToggle />
        </div>
      )}
    </nav>
  );
};
