import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import api from '../../services/api';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailParam = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: emailParam,
      otp: '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/verify-email', data);
      dispatch(addToast({ message: 'Email verification successful! You can now log in.', type: 'success' }));
      navigate('/login');
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Verification failed. Please check the code.', 
        type: 'error' 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailParam) {
      dispatch(addToast({ message: 'Email parameter is missing', type: 'error' }));
      return;
    }
    try {
      await api.post('/auth/send-otp', { email: emailParam });
      dispatch(addToast({ message: 'A new verification OTP code was sent to your email', type: 'info' }));
    } catch (error) {
      dispatch(addToast({ message: 'Failed to resend code', type: 'error' }));
    }
  };

  return (
    <AuthLayout 
      title="Verify your email" 
      subtitle={`We sent a 6-digit confirmation code to ${emailParam || 'your email'}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="name@restaurant.com"
          error={errors.email?.message}
          required
          {...register('email', { required: 'Email is required' })}
        />

        <Input
          label="Verification Code (OTP)"
          name="otp"
          placeholder="000000"
          error={errors.otp?.message}
          required
          maxLength={6}
          {...register('otp', { 
            required: 'Verification OTP is required',
            minLength: { value: 6, message: 'OTP must be exactly 6 digits' },
            maxLength: { value: 6, message: 'OTP must be exactly 6 digits' }
          })}
        />

        <Button 
          type="submit" 
          loading={loading} 
          className="w-full mt-2"
        >
          Verify account
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center space-y-2 text-xs">
        <button
          onClick={handleResend}
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Resend verification code
        </button>
        <span className="text-slate-400 dark:text-zinc-500">
          Already verified? <a href="/login" className="text-primary font-semibold">Sign in</a>
        </span>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
