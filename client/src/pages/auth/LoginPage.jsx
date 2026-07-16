import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import useAuth from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    const success = await login(data);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to manage your restaurant"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="name@restaurant.com"
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

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Password <span className="text-danger">*</span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required'
            })}
          />
        </div>

        <Button 
          type="submit" 
          loading={loading} 
          className="w-full mt-2"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-400">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Register owner account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
