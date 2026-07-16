import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 px-6 text-center transition-colors duration-200">
      <div className="p-4 bg-red-100 rounded-full text-red-600 dark:bg-red-950/30 dark:text-red-500 mb-6 animate-scale-in">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">
        Access Denied
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 max-w-sm">
        You do not have the required permissions or role configurations to view this resource. Please contact your administrator.
      </p>
      <div className="mt-8 flex space-x-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard')}
        >
          Return to dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
