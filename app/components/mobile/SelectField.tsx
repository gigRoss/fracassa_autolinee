'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label: string;
  error?: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * Select field component for forms
 * Matches InputField styling: White background, blue border on focus, red border on error
 */
const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hideLabel = false, className = '', required, placeholder, options, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        <label className="block">
          <span
            className={`
              block text-sm font-medium mb-1
              text-[#162686]
              ${hideLabel ? 'sr-only' : ''}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
          <select
            ref={ref}
            aria-label={hideLabel ? label : undefined}
            aria-required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${props.id}-error` : undefined}
            className={`
              w-full
              min-h-[27px]
              px-3 py-2
              bg-white
              border border-[rgba(0,0,0,0.2)]
              rounded
              text-[#162686] text-[16px]
              transition-all duration-200
              focus:outline-none
              focus:border-[#162686]
              focus:ring-2
              focus:ring-[#162686]
              focus:ring-opacity-20
              disabled:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${!props.value || props.value === '' ? 'text-[rgba(22,38,134,0.5)]' : ''}
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder || 'Seleziona...'}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value} className="text-[#162686]">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {hasError && (
          <p
            id={`${props.id}-error`}
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;

