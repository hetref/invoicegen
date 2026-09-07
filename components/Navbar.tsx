"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth-actions";
import { useRouter, usePathname } from "next/navigation";
import { 
  Menu, 
  Github, 
  Star, 
  X, 
  AlertTriangle,
  FileSpreadsheet,
  LayoutDashboard,
  User,
  LogOut,
  ArrowRight
} from "lucide-react";

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
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            >
              <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight text-neutral-950">
                InvoiceGen
              </span>
            </Link>

            {/* Email verification warning badge in navbar */}
            {session && !isEmailVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 hidden sm:inline-flex">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                Email Unverified
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {/* Landing Page Anchor Links */}
            {!session && isLandingPage && (
              <nav className="flex items-center space-x-1 mr-2 text-xs font-medium text-neutral-600">
                <Link
                  href="#features"
                  className="px-3 py-1.5 rounded-full hover:text-neutral-950 hover:bg-neutral-100/70 transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#use-cases"
                  className="px-3 py-1.5 rounded-full hover:text-neutral-950 hover:bg-neutral-100/70 transition-colors"
                >
                  Use Cases
                </Link>
                <Link
                  href="#faq"
                  className="px-3 py-1.5 rounded-full hover:text-neutral-950 hover:bg-neutral-100/70 transition-colors"
                >
                  FAQ
                </Link>
              </nav>
            )}

            {/* GitHub Star Pill */}
            <Link href="https://github.com/hetref/invoicegen" target="_blank">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition-colors shadow-2xs"
              >
                <Github className="h-3.5 w-3.5 text-neutral-800" />
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="hidden lg:inline">Star on GitHub</span>
              </button>
            </Link>

            {session ? (
              <>
                {/* Verified user dashboard link */}
                {isEmailVerified && (
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all ${
                        pathname === "/dashboard"
                          ? "bg-neutral-100 text-neutral-950 font-semibold"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                      }`}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 mr-1.5 text-neutral-500" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                {/* Profile link */}
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all ${
                      pathname === "/profile"
                        ? "bg-neutral-100 text-neutral-950 font-semibold"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                    }`}
                  >
                    <User className="h-3.5 w-3.5 mr-1.5 text-neutral-500" />
                    Profile
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-full border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-medium gap-1.5"
                  onClick={logoutHandler}
                >
                  <LogOut className="h-3 w-3 text-neutral-500" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="h-8 px-4 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium shadow-xs transition-all"
                  >
                    <span>Get Started</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-neutral-200/80">
                  <Menu className="h-4 w-4 text-neutral-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" hideCloseButton className="w-[300px] sm:w-[360px] p-6 bg-[#FAFAFA] flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Mobile Logo & Close */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setOpen(false)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <span className="text-base font-semibold text-neutral-950">
                        InvoiceGen
                      </span>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-100 text-neutral-700 shadow-2xs"
                      onClick={() => setOpen(false)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>

                  {/* Verification Notice in Mobile */}
                  {session && !isEmailVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Email Not Verified</span>
                      </div>
                      <p className="text-amber-700 text-[11px]">
                        Please check your inbox to access all features.
                      </p>
                    </div>
                  )}

                  {/* Navigation Links in Mobile */}
                  <div className="space-y-1 text-sm font-medium">
                    {session ? (
                      <>
                        {isEmailVerified && (
                          <Link href="/dashboard" onClick={() => setOpen(false)}>
                            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                              pathname === "/dashboard"
                                ? "bg-neutral-900 text-white"
                                : "text-neutral-700 hover:bg-neutral-100"
                            }`}>
                              <LayoutDashboard className="h-4 w-4" />
                              <span>Dashboard</span>
                            </div>
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setOpen(false)}>
                          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                            pathname === "/profile"
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-700 hover:bg-neutral-100"
                          }`}>
                            <User className="h-4 w-4" />
                            <span>Profile & Settings</span>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        {isLandingPage && (
                          <>
                            <Link href="#features" onClick={() => setOpen(false)}>
                              <div className="px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors">
                                Features
                              </div>
                            </Link>
                            <Link href="#use-cases" onClick={() => setOpen(false)}>
                              <div className="px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors">
                                Use Cases
                              </div>
                            </Link>
                            <Link href="#faq" onClick={() => setOpen(false)}>
                              <div className="px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors">
                                FAQ
                              </div>
                            </Link>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Actions in Mobile */}
                <div className="space-y-3 pt-6 border-t border-neutral-200">
                  <Link
                    href="https://github.com/hetref/invoicegen"
                    target="_blank"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 rounded-xl border-neutral-200 text-neutral-800 text-xs font-medium justify-center gap-2"
                    >
                      <Github className="h-4 w-4" />
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>Star on GitHub</span>
                    </Button>
                  </Link>

                  {session ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-9 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 justify-center gap-1.5"
                      onClick={logoutHandler}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/sign-in" onClick={() => setOpen(false)}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-9 rounded-xl border-neutral-200 text-xs font-medium"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setOpen(false)}>
                        <Button
                          size="sm"
                          className="w-full h-9 rounded-xl bg-neutral-950 text-white text-xs font-medium"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
