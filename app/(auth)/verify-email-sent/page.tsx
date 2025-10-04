"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailSentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent you a verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Account Created Successfully!</h3>
                <p className="text-sm text-green-700">
                  Please check your email inbox and click the verification link to activate your account.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">What's Next?</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  <span>Open your email inbox (check spam folder if needed)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  <span>Click the verification link in the email</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  <span>Sign in to access your dashboard</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> The verification link will expire in 1 hour. If you don't receive the email within a few minutes, check your spam folder or contact support.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Link href="/sign-in" className="block">
              <Button className="w-full" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Sign In
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Didn't receive the email?{" "}
              <Link href="/sign-in" className="text-blue-600 hover:underline">
                Sign in to resend
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

