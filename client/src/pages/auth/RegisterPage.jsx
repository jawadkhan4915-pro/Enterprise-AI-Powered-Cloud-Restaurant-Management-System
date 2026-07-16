import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const RegisterPage = () => {
  const { register: signup, loading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'restaurant_owner' // defaults to owner register on landing/auth path
    }
  });

  const onSubmit = async (data) => {
    const success = await signup(data);
    if (success) {
      // Redirect to email verification page with email in state query
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    }
  };

  return (
    <AuthLayout 
      title="Create owner account" 
      subtitle="Register the primary business administrator profile"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          placeholder="Chef Admin"
          error={errors.name?.message}
          required
          {...register('name', { required: 'Name is required' })}
        />

        <Input
          label="Business email"
          name="email"
          type="email"
          placeholder="owner@restaurant.com"
          error={errors.email?.message}
          required
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />

        <Input
          label="Account password"
          name="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          required
          {...register('password', {
            required: 'Password is required',
            pattern: {
              value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
              message: 'At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char'
            }
          })}
        />

        <Button 
          type="submit" 
          loading={loading} 
          className="w-full mt-2"
        >
          Register business
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-400">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
