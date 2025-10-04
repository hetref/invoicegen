import React from 'react'
import SignIn from '@/components/auth/SignIn'

const SignInPage = async () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-center">
          Sign in to your account to continue
        </p>
      </div>

      <SignIn />
    </div>
  )
}

export default SignInPage
