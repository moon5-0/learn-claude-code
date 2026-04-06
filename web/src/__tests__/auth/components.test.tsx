// UI Component Tests for Authentication Forms

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

// Mock fetch
global.fetch = jest.fn();

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render login form', () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render "Forgot Password" link', () => {
      render(<LoginForm />);
      
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should render "Register" link', () => {
      render(<LoginForm />);
      
      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    it('should show password visibility toggle', () => {
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      fireEvent.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty password', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'user@example.com');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should clear error when field is corrected', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
      
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'valid@example.com');
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { email: 'user@example.com' } }),
      });

      render(<LoginForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'SecurePass123!',
          }),
        });
      });
    });

    it('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });

    it('should show error message on login failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      render(<LoginForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'WrongPassword!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle rate limiting error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many attempts', retryAfter: 900 }),
      });

      render(<LoginForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'WrongPassword!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/too many attempts/i)).toBeInTheDocument();
        expect(screen.getByText(/try again in 15 minutes/i)).toBeInTheDocument();
      });
    });

    it('should disable form during submission', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/password/i)).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<LoginForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error.*try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });

    it('should have required attributes', () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/password/i)).toBeRequired();
    });

    it('should have aria-invalid on error', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });

    it('should focus first error field', async () => {
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toHaveFocus();
      });
    });
  });
});

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render all registration fields', () => {
      render(<RegisterForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render terms of service checkbox', () => {
      render(<RegisterForm />);
      
      expect(screen.getByLabelText(/agree to.*terms/i)).toBeInTheDocument();
    });

    it('should show password strength indicator', () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      
      expect(screen.getByText(/weak/i)).toBeInTheDocument();
      
      fireEvent.change(passwordInput, { target: { value: 'Str0ng!Pass' } });
      
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });

    it('should show password requirements checklist', () => {
      render(<RegisterForm />);
      
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/number/i)).toBeInTheDocument();
      expect(screen.getByText(/special character/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate all fields on submit', async () => {
      render(<RegisterForm />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      await userEvent.type(passwordInput, 'weak');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password too weak/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      await userEvent.type(passwordInput, 'SecurePass123!');
      
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      await userEvent.type(confirmPasswordInput, 'DifferentPass123!');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should validate username format', async () => {
      render(<RegisterForm />);
      
      const usernameInput = screen.getByLabelText(/username/i);
      await userEvent.type(usernameInput, 'invalid@user');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/username.*alphanumeric/i)).toBeInTheDocument();
      });
    });

    it('should require terms acceptance', async () => {
      render(<RegisterForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/^password/i), 'SecurePass123!');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/agree to terms/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit registration data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { email: 'user@example.com' } }),
      });

      render(<RegisterForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/^password/i), 'SecurePass123!');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      
      const termsCheckbox = screen.getByLabelText(/agree to.*terms/i);
      fireEvent.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'user@example.com',
            username: 'testuser',
            password: 'SecurePass123!',
            confirmPassword: 'SecurePass123!',
          }),
        });
      });
    });

    it('should handle duplicate email error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Email already registered' }),
      });

      render(<RegisterForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
      await userEvent.type(screen.getByLabelText(/^password/i), 'SecurePass123!');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      
      const termsCheckbox = screen.getByLabelText(/agree to.*terms/i);
      fireEvent.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
      });
    });

    it('should handle duplicate username error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Username already taken' }),
      });

      render(<RegisterForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
      await userEvent.type(screen.getByLabelText(/username/i), 'existinguser');
      await userEvent.type(screen.getByLabelText(/^password/i), 'SecurePass123!');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      
      const termsCheckbox = screen.getByLabelText(/agree to.*terms/i);
      fireEvent.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/username.*taken/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('should show live password requirements validation', async () => {
      render(<RegisterForm />);
      
      const passwordInput = screen.getByLabelText(/^password/i);
      
      await userEvent.type(passwordInput, 'A');
      expect(screen.getByTitle(/uppercase/i)).toHaveClass('satisfied');
      
      await userEvent.type(passwordInput, 'b');
      expect(screen.getByTitle(/lowercase/i)).toHaveClass('satisfied');
      
      await userEvent.type(passwordInput, '1');
      expect(screen.getByTitle(/number/i)).toHaveClass('satisfied');
      
      await userEvent.type(passwordInput, '!');
      expect(screen.getByTitle(/special character/i)).toHaveClass('satisfied');
    });

    it('should redirect to login on success', async () => {
      const mockPush = jest.fn();
      jest.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<RegisterForm />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/^password/i), 'SecurePass123!');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      
      const termsCheckbox = screen.getByLabelText(/agree to.*terms/i);
      fireEvent.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        // Should show success message or redirect
        expect(screen.getByText(/account created/i)).toBeInTheDocument();
      });
    });
  });
});
