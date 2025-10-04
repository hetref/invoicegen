"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { sendVerificationEmail } from "@/lib/actions/auth-actions";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  session: any;
}

export function EmailVerificationGuard({ children, session }: EmailVerificationGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Check if email is verified
  const isEmailVerified = session?.user?.emailVerified;

  // Allow access to profile page even if email is not verified
  const isProfilePage = pathname === "/profile";

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!session?.user?.email) return;

    setIsResending(true);
    try {
      const result = await sendVerificationEmail(session.user.email);
      
      if (result.success) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox and spam folder.",
        });
        
        // Start countdown for resend button
        setCanResend(false);
        setCountdown(60);
        
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // If email is verified OR user is on profile page, show children
  if (isEmailVerified || isProfilePage) {
    return <>{children}</>;
  }

  // Otherwise, show verification required screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <Mail className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Email Verification Required</CardTitle>
          <CardDescription className="text-base">
            Please verify your email address to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2">
              <strong>Access Restricted:</strong> You must verify your email address before you can upload, create, or manage invoices.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                We've sent a verification email to:
              </p>
              <p className="font-semibold text-lg">{session?.user?.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Next Steps:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  <span>Check your email inbox (and spam folder)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  <span>Click the verification link in the email</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  <span>Return here and refresh the page</span>
                </li>
              </ol>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={isResending || !canResend}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : !canResend ? (
                  <>Resend in {countdown}s</>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                onClick={() => router.push("/profile")}
                variant="default"
                className="w-full"
              >
                Go to Profile
              </Button>

              <Button
                onClick={() => router.refresh()}
                variant="outline"
                className="w-full"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                I've Verified My Email
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Wrong email address?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => router.push("/sign-out")}
              >
                Sign out and create a new account
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
