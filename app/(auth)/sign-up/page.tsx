import React from 'react'
import SignUp from '@/components/auth/SignUp'

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-gray-600 text-center">
          Join us today and start generating invoices
        </p>
      </div>

      <SignUp />
    </div>
  )
}

export default SignUpPage
