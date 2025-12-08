'use client';

import { useState, FormEvent, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/lib/api';
import { validateOTP, type ValidationError } from '@/lib/validation';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Format timer as M:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setApiError(null);
    setErrors([]);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 4).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 4) newOtp[i] = digit;
        });
        setOtp(newOtp);
        // Focus the last filled input or the first empty one
        const lastFilledIndex = digits.length - 1;
        if (lastFilledIndex < 3) {
          inputRefs.current[lastFilledIndex + 1]?.focus();
        } else {
          inputRefs.current[3]?.focus();
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 4) newOtp[i] = digit;
    });
    setOtp(newOtp);
    // Focus the last filled input or the first empty one
    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex < 3) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    } else {
      inputRefs.current[3]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !emailFromQuery) return;

    // Reset timer
    setResendTimer(30);
    setCanResend(false);
    setApiError(null);

    // Here you would call an API endpoint to resend the code
    // For now, we'll just show a message
    alert('Verification code has been resent to your email.');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    // Combine OTP digits
    const otpString = otp.join('');

    // Client-side validation
    const validationErrors: ValidationError[] = [];
    const otpError = validateOTP(otpString);
    if (otpError) validationErrors.push(otpError);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!emailFromQuery) {
      setApiError('Email address is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyEmail({
        email: emailFromQuery,
        OTP: otpString,
      });

      if (response.success) {
        setSuccess(true);
        // Redirect to signin page after 2 seconds
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } else {
        setApiError(response.error || 'Email verification failed. Please try again.');
        // Clear OTP on error
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8">
          {/* Header */}
          <h1 className="text-center text-[#25324B] mb-6 font-[var(--font-poppins)] font-black text-[32px] leading-[120%] tracking-[0%]">
            Verify Email
          </h1>

          {/* Description */}
          <p className="text-[14px] font-[var(--font-epilogue)] font-normal text-[#7C8493] text-justify mb-8 max-w-md mx-auto leading-[160%] tracking-[0%]">
            We've sent a verification code to the email address you provided. To complete the verification process, please enter the code here.
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
              Email verified successfully! Redirecting to sign in...
            </div>
          )}

          {/* Error Message */}
          {apiError && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {apiError}
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Four OTP Input Fields */}
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-16 h-16 text-center text-2xl font-semibold rounded-lg border-2 transition-colors focus:outline-none ${
                    errors.find((err) => err.field === 'OTP')
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-[#B1AEF1] bg-white focus:border-[#B1AEF1]'
                  }`}
                  placeholder="0"
                  disabled={isLoading}
                  autoComplete="off"
                />
              ))}
            </div>

            {/* Resend Code Section */}
            <div className="text-center mb-6">
              <span className="text-sm font-[var(--font-epilogue)] text-[#7C8493]">
                You can request to{' '}
              </span>
              <span className="text-sm font-semibold font-[var(--font-epilogue)] text-[#2D298E]">
                Resend code
              </span>
              <span className="text-sm font-[var(--font-epilogue)] text-[#7C8493]">
                {' '}in{' '}
              </span>
              {!canResend ? (
                <span className="text-sm font-semibold font-[var(--font-epilogue)] text-[#2D298E]">
                  {formatTimer(resendTimer)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm font-semibold font-[var(--font-epilogue)] text-[#2D298E] underline hover:text-blue-500 transition-colors"
                >
                  Resend code
                </button>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading || otp.some((digit) => !digit)}
              className="w-full rounded-full bg-[#C7C6F5] px-4 py-3 font-[var(--font-epilogue)] font-bold text-[16px] leading-[160%] tracking-[0%] text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isLoading ? 'Verifying...' : 'Continue'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg p-8">
            <div className="text-center">
              <p className="text-[#202430]/70 font-[var(--font-epilogue)]">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
