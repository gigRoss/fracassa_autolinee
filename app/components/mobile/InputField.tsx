'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hideLabel?: boolean;
}

/**
 * Input field component for forms
 * White background, blue border on focus, red border on error
 * 267px × 27px as per Figma specs
 */
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hideLabel = false, className = '', required, ...props }, ref) => {
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
          <input
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
              placeholder:text-[rgba(22,38,134,0.5)]
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
              ${className}
            `}
            {...props}
          />
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

InputField.displayName = 'InputField';

export default InputField;



