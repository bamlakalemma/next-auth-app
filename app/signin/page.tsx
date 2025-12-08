'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signin } from '@/lib/api';
import { validateSigninForm, type ValidationError } from '@/lib/validation';
import { setToken, setUser } from '@/lib/auth';

export default function SigninPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user starts typing
    setErrors((prev) => prev.filter((err) => err.field !== name));
    setApiError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    // Client-side validation
    const validationErrors = validateSigninForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await signin(formData);

      console.log('Signin response:', response); // Debug log

      if (response.success) {
        // Store token if available
        if (response.token) {
          setToken(response.token);
        }
        // Store user data if available
        if (response.data) {
          setUser(response.data);
        }
        // Redirect to home page even if no token (some APIs might handle auth differently)
        router.push('/');
      } else {
        // Show the actual error message from the API
        const errorMessage = response.error || 'Sign in failed. Please check your credentials.';
        setApiError(errorMessage);
        console.error('Signin failed:', errorMessage);
      }
    } catch (error) {
      console.error('Signin exception:', error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find((err) => err.field === fieldName)?.message;
  };

  return (
    <div className="flex min-h-screen items-center justify-end px-4 py-12">
      <div className="w-full max-w-md mr-45">
        <div className="bg-white rounded-lg p-8">
          {/* Header */}
          <h1 className="text-center text-[#25324B] mb-6 font-[var(--font-poppins)] font-black text-[32px] leading-[120%] tracking-[0%]">
            Welcome Back,
          </h1>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-8 gap-9">
            <div className="flex-1 h-[1px] bg-gray-300"></div>
            <div className="w-[108px] "></div>
            <div className="flex-1 h-[1px] bg-gray-300"></div>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {apiError}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#515B6F] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 transition-colors placeholder:text-[#A8ADB7] ${
                  getFieldError('email')
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-1`}
                placeholder="Enter email address"
                disabled={isLoading}
                autoComplete="email"
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#515B6F] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 transition-colors placeholder:text-[#A8ADB7] ${
                  getFieldError('password')
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-1`}
                placeholder="Enter password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#2D298E] px-4 py-3 font-[var(--font-epilogue)] font-bold text-[16px] leading-[160%] tracking-[0%] text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-start text-[14px] font-[var(--font-epilogue)] font-medium leading-[160%] tracking-[0%] text-[#202430]/70">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-[#2D298E] "
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
