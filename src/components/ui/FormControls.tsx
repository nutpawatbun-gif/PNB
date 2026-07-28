import React from 'react';

interface BaseFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export interface InputFieldProps extends BaseFieldProps, React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  required,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`space-y-1 text-left ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-2xs">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={`w-full text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:ring-amber-400/20 dark:focus:border-amber-400 ${
            icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
          } ${
            error
              ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        />
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};

export interface SelectFieldProps extends BaseFieldProps, React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string | number; label: string }>;
  icon?: React.ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  helperText,
  required,
  options,
  icon,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`space-y-1 text-left ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-2xs">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <select
          id={selectId}
          {...props}
          className={`w-full text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:ring-amber-400/20 dark:focus:border-amber-400 ${
            icon ? 'pl-10 pr-8 py-2.5' : 'px-3.5 py-2.5'
          } ${
            error
              ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};

export interface TextareaFieldProps extends BaseFieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`space-y-1 text-left ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        {...props}
        className={`w-full text-sm rounded-xl border px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:ring-amber-400/20 dark:focus:border-amber-400 ${
          error
            ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};
