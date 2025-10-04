"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth-actions";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Github, Star, X, AlertTriangle } from "lucide-react";

type Session = typeof auth.$Infer.Session;

const Navbar = ({ session }: { session: Session | null }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    await signOut();
    setOpen(false);
    router.push("/sign-in");
  };

  const isLandingPage = pathname === "/";
  const isEmailVerified = session?.user?.emailVerified;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              InvoiceGen
            </Link>
            {/* Show verification warning badge in navbar */}
            {session && !isEmailVerified && (
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 hidden sm:flex">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Email Not Verified
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* GitHub Star Button - Always visible */}
            <Link href="https://github.com/hetref/invoicegen" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-gray-100"
              >
                <Github className="h-4 w-4" />
                <Star className="h-4 w-4" />
                <span className="hidden lg:inline">Star on GitHub</span>
              </Button>
            </Link>

            {session && (
              <>
                {/* Only show Dashboard link if email is verified */}
                {isEmailVerified && (
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}
                
                {/* Always show Profile link */}
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Profile
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={logoutHandler}
                >
                  Logout
                </Button>
              </>
            )}
            {!session && (
              <>
                {isLandingPage && (
                  <>
                    <Link href="#features">
                      <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                        Features
                      </Button>
                    </Link>
                    <Link href="#use-cases">
                      <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                        Use Cases
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Logo in mobile menu */}
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      href="/"
                      className="text-xl font-bold text-gray-900"
                      onClick={() => setOpen(false)}
                    >
                      InvoiceGen
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Verification warning in mobile menu */}
                  {session && !isEmailVerified && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-700" />
                        <p className="text-sm text-yellow-700 font-medium">
                          Email Not Verified
                        </p>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        Please verify your email to access all features
                      </p>
                    </div>
                  )}

                  {/* GitHub Star Button */}
                  <Link
                    href="https://github.com/hetref/invoicegen"
                    target="_blank"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2 justify-start"
                    >
                      <Github className="h-4 w-4" />
                      <Star className="h-4 w-4" />
                      Star on GitHub
                    </Button>
                  </Link>

                  {session && (
                    <>
                      {/* Only show Dashboard in mobile if verified */}
                      {isEmailVerified && (
                        <Link href="/dashboard" onClick={() => setOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                          >
                            Dashboard
                          </Button>
                        </Link>
                      )}
                      
                      {/* Always show Profile */}
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                        >
                          Profile
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={logoutHandler}
                      >
                        Logout
                      </Button>
                    </>
                  )}
                  {!session && (
                    <>
                      {isLandingPage && (
                        <>
                          <Link href="#features" onClick={() => setOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                              Features
                            </Button>
                          </Link>
                          <Link href="#use-cases" onClick={() => setOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                              Use Cases
                            </Button>
                          </Link>
                        </>
                      )}
                      <Link href="/sign-in" onClick={() => setOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
