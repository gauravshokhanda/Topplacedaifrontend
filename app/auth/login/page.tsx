'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Linkedin, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkedInLogin = () => {
    setIsLoading(true);
    // Simulate LinkedIn OAuth flow
    setTimeout(() => {
      window.location.href = '/learner';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00FFB2]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC8E]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Back to Home */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-[#00FFB2] transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 neon-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-xl">SM</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue your career journey</p>
          </div>

          {/* LinkedIn Login */}
          <button
            onClick={handleLinkedInLogin}
            disabled={isLoading}
            className="w-full bg-[#0077B5] hover:bg-[#0066A0] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center mb-6 transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="loading-dots">Connecting</div>
            ) : (
              <>
                <Linkedin size={20} className="mr-3" />
                Continue with LinkedIn
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#00FFB2] bg-[#1A1A1A] border-gray-600 rounded focus:ring-[#00FFB2]" />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[#00FFB2] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 font-semibold"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-[#00FFB2] hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Role Selection */}
          <div className="mt-8 pt-6 border-t border-gray-600">
            <p className="text-center text-sm text-gray-400 mb-4">Quick Access</p>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/learner" 
                className="text-center py-2 px-3 bg-[#1A1A1A] border border-gray-600 rounded-lg hover:border-[#00FFB2] transition-colors text-sm"
              >
                I'm a Learner
              </Link>
              <Link 
                href="/mentor" 
                className="text-center py-2 px-3 bg-[#1A1A1A] border border-gray-600 rounded-lg hover:border-[#00FFB2] transition-colors text-sm"
              >
                I'm a Mentor
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Trusted by 10,000+ professionals worldwide</p>
        </div>
      </div>
    </div>
  );
}