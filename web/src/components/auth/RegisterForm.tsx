'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail, validateUsername, validatePassword, validatePasswordMatch } from '@/lib/auth/validation';

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Number', test: (p: string) => /\d/.test(p) },
    { label: 'Special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  function getPasswordStrength(password: string): string {
    const passed = passwordRequirements.filter(req => req.test(password)).length;
    if (passed < 2) return 'Weak';
    if (passed < 4) return 'Medium';
    return 'Strong';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    const emailResult = validateEmail(formData.email);
    if (!emailResult.valid) newErrors.email = emailResult.errors[0];
    
    const usernameResult = validateUsername(formData.username);
    if (!usernameResult.valid) newErrors.username = usernameResult.errors[0];
    
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.valid) newErrors.password = passwordResult.errors[0];
    
    const passwordMatchResult = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!passwordMatchResult.valid) newErrors.confirmPassword = passwordMatchResult.errors[0];
    
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms of service';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          if (data.error.includes('Email')) {
            setErrors({ email: data.error });
          } else if (data.error.includes('Username')) {
            setErrors({ username: data.error });
          } else {
            setErrors({ general: data.error });
          }
        } else {
          setErrors({ general: data.error || 'Failed to create account' });
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

  function updateField(field: string, value: string) {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      
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
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.email}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => updateField('username', e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.username}
            required
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
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
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.password}
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
          
          {/* Password requirements */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium">
                Strength: <span className={`font-bold ${
                  getPasswordStrength(formData.password) === 'Strong' ? 'text-green-600' :
                  getPasswordStrength(formData.password) === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {getPasswordStrength(formData.password)}
                </span>
              </p>
              <div className="text-xs space-y-1">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className={`flex items-center ${
                    req.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <span className="mr-1">{req.test(formData.password) ? '✓' : '○'}</span>
                    <span title={req.label}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.confirmPassword}
            required
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        
        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => {
                setAgreeToTerms(e.target.checked);
                if (errors.terms) setErrors({ ...errors, terms: '' });
              }}
              disabled={isLoading}
              className="mt-1 mr-2"
            />
            <span className="text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
        
        <p className="text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
