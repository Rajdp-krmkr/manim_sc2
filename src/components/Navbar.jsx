"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CgMenuGridO, CgClose } from "react-icons/cg";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only apply scroll behavior for non-authenticated users
    if (!isAuthenticated) {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        // Show navbar after scrolling down 100px
        if (scrollY > 100) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // For authenticated users, always show the navbar
      setIsVisible(true);
    }
  }, [isAuthenticated]);

  // Navigation items based on authentication status
  const authenticatedNavItems = isAuthenticated
    ? [
        { name: "Home", href: "/" },
        { name: "Library", href: "/library" },
        { name: "Generate", href: "/generate" },
      ]
    : [
        { name: "Home", href: "#home" },
        { name: "Features", href: "#features" },
        { name: "Examples", href: "#examples" },
        { name: "About", href: "#about" },
        { name: "Contact", href: "#contact" },
      ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800 transition-transform duration-500 ease-in-out ${
        isVisible ? "transform translate-y-0" : "transform -translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">manimate</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {authenticatedNavItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:block relative">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <FiUser className="text-sm" />
                    </div>
                  )}
                  <span className="text-sm">
                    {user?.displayName || user?.email || "User"}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-white font-medium">
                        {user?.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-2"
                    >
                      <FiLogOut className="text-sm" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/auth"
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Sign In
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMenuOpen ? (
                <CgClose className="h-6 w-6" />
              ) : (
                <CgMenuGridO className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900 rounded-lg mt-2 border border-gray-700">
              {authenticatedNavItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
