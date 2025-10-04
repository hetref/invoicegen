"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Password reset link sent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <Mail className="h-5 w-5 text-green-600" />
              <AlertDescription className="ml-2">
                We've sent a password reset link to <strong>{email}</strong>
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Next Steps:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">1.</span>
                  <span>Check your email inbox (and spam folder)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">2.</span>
                  <span>Click the reset link in the email</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">3.</span>
                  <span>Create a new password</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Note:</strong> The reset link will expire in 1 hour for security reasons.
              </p>
            </div>

            <Link href="/sign-in" className="block">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="[email protected]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <Link href="/sign-in">
                <Button variant="link" className="text-sm">
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

