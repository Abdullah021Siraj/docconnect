"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useState } from "react";

import { FiMenu, FiX } from "react-icons/fi";

import { useCurrentUser } from "../../../../hooks/use-current-user";
import { RegisterButton } from "@/src/components/auth/register-button";
import { FaLongArrowAltRight } from "react-icons/fa";
import { LoginButton } from "@/src/components/auth/login-button";
import { UserButton } from "@/src/components/auth/user-button";
import { ModeToggle } from "@/src/components/mode-toggle";
import { NotificationButton } from "@/src/components/auth/notification-button";

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isMainPage = pathname === "/";

  const user = useCurrentUser();

  return (
    <>
      <nav className="bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#FF685B] p-4 w-full  mx-auto fixed top-0 inset-x-0 z-50 flex justify-between items-center">
        <Link href="/" className="text-lg font-semibold  text-black">
          DocConnect
        </Link>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-x-2">
          {pathname !== "/" && (
            <>
              <NotificationButton />
              {/* <Button
                asChild
                variant={pathname === "/server" ? "default" : "outline"}
              >
                <Link href="/server">User Information</Link>
              </Button> */}
              <Button
                asChild
                variant="ghost"
                className=" font-semibold text-black"
              >
                <Link href="/settings">Home</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className=" font-semibold text-black"
              >
                <Link href="/settings">Products</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className=" font-semibold text-black"
              >
                <Link href="/settings">Pricing</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className=" font-semibold text-black"
              >
                <Link href="/settings">Contact</Link>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-black "
                >
                  <Link href="/">Home</Link>
                </Button>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className=" font-semibold text-black "
                >
                  <Link href="/">Product</Link>
                </Button>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className=" font-semibold text-black"
                >
                  <Link href="/">Pricing</Link>
                </Button>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-black"
                >
                  <Link href="/">Contact</Link>
                </Button>
              </div>
              <div>
                <LoginButton mode="modal" asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#FF685B] font-semibold  hover:bg-[#FFFFFF]/90"
                  >
                    Login
                  </Button>
                </LoginButton>
              </div>
              <div>
                <RegisterButton mode="modal" asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-[#FF685B] font-semibold  text-white hover:bg-[#FFFFFF]/90"
                  >
                    Join us <FaLongArrowAltRight />
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
          <div className="absolute opacity-90 top-full left-0 w-full bg-secondary rounded-b-lg shadow-lg p-4 flex flex-row  flex-wrap items-center gap-y-4 md:hidden transition-all duration-300 ease-in-out rounded-xl">
            {!isMainPage && (
              <>
                <div>
                  <LoginButton mode="modal" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#FF685B] font-semibold  hover:bg-[#FFFFFF]/90"
                    >
                      Login
                    </Button>
                  </LoginButton>
                </div>
                <div>
                  <RegisterButton mode="modal" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-[#FF685B] font-semibold  text-white hover:bg-[#FFFFFF]/90"
                    >
                      Join us
                    </Button>
                  </RegisterButton>
                </div>
              </>
            )}
            {isMainPage && (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className=" font-semibold text-black"
                >
                  <Link href="/">Home</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className=" font-semibold text-black"
                >
                  <Link href="/">Products</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className=" font-semibold text-black"
                >
                  <Link href="/">Pricing</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className=" font-semibold text-black"
                >
                  <Link href="/">Contact</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-[#FF685B] font-semibold  hover:bg-[#FFFFFF]/90"
                >
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="bg-[#FF685B] font-semibold  text-white hover:bg-[#FFFFFF]/90"
                >
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join us <FaLongArrowAltRight />
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </nav>
      <div className="mt-40"></div>
    </>
  );
};
