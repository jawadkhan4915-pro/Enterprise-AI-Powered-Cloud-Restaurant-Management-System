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

  const handleFillDemo = (email) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password@123', { shouldValidate: true });
  };

  const demoAccounts = [
    { role: 'Owner', email: 'owner@test.com', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-405' },
    { role: 'Manager', email: 'manager@test.com', color: 'bg-blue-500/10 text-blue-650 dark:text-blue-400' },
    { role: 'Cashier', email: 'cashier@test.com', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { role: 'Waiter', email: 'waiter@test.com', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { role: 'Chef', email: 'chef@test.com', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    { role: 'Inventory', email: 'inventory@test.com', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { role: 'Accountant', email: 'accountant@test.com', color: 'bg-teal-500/10 text-teal-650 dark:text-teal-400' }
  ];

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
      <div className="mt-6 p-4 rounded-xl border border-slate-200/50 dark:border-zinc-800 bg-slate-100/30 dark:bg-zinc-900/10 backdrop-blur-sm transition-all duration-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary animate-pulse" />
            <h4 className="text-[10px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Quick Demo Accounts
            </h4>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold font-mono">Password: Password@123</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleFillDemo(account.email)}
                className="flex flex-col items-start justify-center p-2 rounded-lg border border-slate-200/60 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 text-left w-full group shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-pill uppercase tracking-wider ${account.color}`}>
                    {account.role}
                  </span>
                  <span className="text-[8px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Fill →</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-1 block truncate w-full">
                  {account.email}
                </span>
              </button>
            ))}
          </div>
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
