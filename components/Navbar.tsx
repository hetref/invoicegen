"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth-actions";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Github, Star, X } from "lucide-react";

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

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              InvoiceGen
            </Link>
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
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Button>
                </Link>
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
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* GitHub Star Button */}
                  <Link href="https://github.com/hetref/invoicegen" target="_blank" onClick={() => setOpen(false)}>
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
                      <Link href="/dashboard" onClick={() => setOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
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
                          className="w-full justify-start"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                          Get Started
                        </Button>
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
