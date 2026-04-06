'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail } from '@/lib/auth/validation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    
    // Validate fields
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.errors[0];
      }
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          const minutes = Math.ceil(data.retryAfter / 60);
          setErrors({
            general: `Too many login attempts. Try again in ${minutes} minutes.`
          });
        } else if (response.status === 401) {
          setErrors({ general: data.error });
          // Clear password on auth failure
          setPassword('');
        } else {
          setErrors({ general: data.error || 'Failed to login' });
        }
        return;
      }
      
      // Success - redirect to dashboard
      router.push('/dashboard');
      router.refresh();
      
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {errors.general}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            required
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Toggle password visibility"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" data-testid="loading-spinner" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
        
        <div className="flex justify-between text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
          <a href="/register" className="text-blue-600 hover:underline">
            Create account
          </a>
        </div>
      </form>
    </div>
  );
}
