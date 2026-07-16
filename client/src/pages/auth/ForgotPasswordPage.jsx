import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import api from '../../services/api';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      dispatch(addToast({ message: 'Reset password OTP sent to email!', type: 'success' }));
      navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Failed to trigger password reset process', 
        type: 'error' 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Forgot password" 
      subtitle="Enter your email address to receive a verification OTP code"
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

        <Button 
          type="submit" 
          loading={loading} 
          className="w-full mt-2"
        >
          Send OTP
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-400">
        Remembered password?{' '}
        <Link 
          to="/login" 
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
