import React from 'react';

export const Skeleton = ({
  variant = 'text', // text, circular, rectangular
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClass = 'shimmer-bg animate-pulse';
  
  const variants = {
    text: 'h-4 rounded w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-card',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="border border-slate-100 p-5 rounded-card space-y-4 bg-white dark:bg-zinc-950 dark:border-zinc-900 w-full">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" width="60%" height={12} />
          <Skeleton variant="text" width="40%" height={10} />
        </div>
      </div>
      <Skeleton variant="rectangular" height={100} />
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="30%" height={10} />
        <Skeleton variant="text" width="20%" height={14} />
      </div>
    </div>
  );
};

export default Skeleton;
