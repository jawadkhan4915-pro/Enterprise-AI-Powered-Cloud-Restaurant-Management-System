import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Key } from 'lucide-react';
import { addToast } from '../../redux/slices/ui.slice';
import useAuth from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
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

  const handleFillDemo = () => {
    setValue('email', 'owner@test.com', { shouldValidate: true });
    setValue('password', 'Password@123', { shouldValidate: true });
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

      {/* Demo Credentials Box */}
      <div className="mt-6 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 backdrop-blur-sm transition-all duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Demo Credentials
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                owner@test.com / Password@123
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleFillDemo}
            className="shrink-0"
          >
            Auto Fill
          </Button>
        </div>
      </div>

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
