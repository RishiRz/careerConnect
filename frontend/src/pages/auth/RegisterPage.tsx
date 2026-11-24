import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address').max(254),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128)
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required').max(100).trim(),
    lastName: z.string().min(1, 'Last name is required').max(100).trim(),
    role: z.enum(['jobseeker', 'recruiter']),
    phone: z.string().max(20).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'jobseeker' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await api.post('/auth/register', data);
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="card text-center shadow-lg border-gray-100">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Your account has been created. A verification link has been sent to your email. You can now proceed to log in.
            </p>
            <Link to="/login" className="btn-primary inline-block w-full">
              Proceed to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <div className="bg-primary-600 text-white p-2.5 rounded-xl shadow-md">
            <Briefcase className="h-8 w-8" />
          </div>
        </Link>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="card shadow-lg border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">I am joining as a</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex cursor-pointer">
                  <input {...register('role')} type="radio" value="jobseeker" className="sr-only peer" />
                  <div className="w-full border-2 border-gray-200 peer-checked:border-primary-600 peer-checked:bg-primary-50 rounded-lg p-3 text-center transition-all">
                    <span className="block font-semibold text-sm text-gray-800 peer-checked:text-primary-700">Job Seeker</span>
                    <span className="text-xs text-gray-500">Looking for jobs</span>
                  </div>
                </label>
                <label className="relative flex cursor-pointer">
                  <input {...register('role')} type="radio" value="recruiter" className="sr-only peer" />
                  <div className="w-full border-2 border-gray-200 peer-checked:border-primary-600 peer-checked:bg-primary-50 rounded-lg p-3 text-center transition-all">
                    <span className="block font-semibold text-sm text-gray-800 peer-checked:text-primary-700">Recruiter</span>
                    <span className="text-xs text-gray-500">Hiring candidates</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                <input {...register('firstName')} id="firstName" type="text" className="input-field" placeholder="Jane" />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                <input {...register('lastName')} id="lastName" type="text" className="input-field" placeholder="Smith" />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input {...register('email')} id="email" type="email" autoComplete="email" className="input-field" placeholder="jane@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Password (min 12 chars)</label>
              <div className="relative">
                <input {...register('password')} id="password" type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
              <input {...register('confirmPassword')} id="confirmPassword" type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••••••" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 mt-2">
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
