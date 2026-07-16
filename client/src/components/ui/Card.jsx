import React from 'react';

export const Card = ({
  children,
  className = '',
  glass = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-card shadow-soft p-5 border border-slate-100 bg-white dark:bg-zinc-950 dark:border-zinc-900 ${
        glass ? 'glass-effect' : ''
      } ${onClick ? 'cursor-pointer hover:shadow-premium active:scale-99 transition-all' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
