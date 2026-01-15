'use client';

import { useState } from 'react';
import Link from 'next/link';
import { validateEmail } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement password reset API endpoint
      // POST /api/auth/forgot-password with email
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-center text-gray-600 mb-6">
              We've sent password reset instructions to{' '}
              <span className="font-medium">{email}</span>
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-500 text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full"
              >
                Try Another Email
              </Button>

              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Feature Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Password reset functionality will be implemented in a future update. This is a placeholder page.
                </p>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  setError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  emailError
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="rajesh.kumar@email.com"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </div>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
