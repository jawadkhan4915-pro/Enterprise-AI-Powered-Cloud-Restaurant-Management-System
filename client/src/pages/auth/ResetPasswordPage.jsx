import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import api from '../../services/api';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailParam = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: emailParam,
      otp: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', data);
      dispatch(addToast({ message: 'Password reset successful! Sign in now.', type: 'success' }));
      navigate('/login');
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Password reset failed. Check OTP.', 
        type: 'error' 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset password" 
      subtitle="Complete your verification and choose a new secure password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Account email"
          name="email"
          type="email"
          placeholder="name@restaurant.com"
          error={errors.email?.message}
          required
          {...register('email', { required: 'Email is required' })}
        />

        <Input
          label="6-Digit OTP"
          name="otp"
          placeholder="000000"
          error={errors.otp?.message}
          required
          maxLength={6}
          {...register('otp', { 
            required: 'OTP code is required',
            minLength: { value: 6, message: 'OTP must be exactly 6 digits' },
            maxLength: { value: 6, message: 'OTP must be exactly 6 digits' }
          })}
        />

        <Input
          label="New password"
          name="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          required
          {...register('password', {
            required: 'New password is required',
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
          Update password
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-400">
        Back to{' '}
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

export default ResetPasswordPage;
