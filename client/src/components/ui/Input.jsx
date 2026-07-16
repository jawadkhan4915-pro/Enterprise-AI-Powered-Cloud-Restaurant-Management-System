import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  placeholder,
  className = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`px-3 py-2 text-sm border bg-white text-slate-900 border-slate-300 rounded-input transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-400 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:focus:ring-primary/50 dark:placeholder:text-zinc-600 ${
          error ? 'border-danger focus:ring-danger/50' : ''
        }`}
        {...props}
      />
      {error && (
        <span className="text-[11px] font-medium text-danger animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
