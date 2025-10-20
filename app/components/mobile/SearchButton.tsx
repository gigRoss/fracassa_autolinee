'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface SearchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  size?: 'default' | 'large';
}

/**
 * Primary search CTA button - circular orange button with search icon
 * Used on Homepage and Search screen
 */
const SearchButton = forwardRef<HTMLButtonElement, SearchButtonProps>(
  ({ loading = false, size = 'default', disabled, className = '', children, ...props }, ref) => {
    const sizeClasses = size === 'large' ? 'w-16 h-16' : 'w-[60px] h-[60px]';
    
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        className={`
          ${sizeClasses}
          rounded-full
          bg-[#F49401]
          border-[3px] border-[#162686]
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
          flex items-center justify-center
          transition-all duration-200
          active:scale-95
          hover:shadow-[0px_6px_8px_0px_rgba(0,0,0,0.3)]
          disabled:opacity-50
          disabled:cursor-not-allowed
          focus:outline-none
          focus:ring-2
          focus:ring-[#162686]
          focus:ring-offset-2
          ${className}
        `}
        aria-label={loading ? "Ricerca in corso..." : "Cerca"}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-[38px] w-[38px] text-[#162685]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="w-[38px] h-[38px] text-[#162685]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 2a8 8 0 105.293 14.707l4.853 4.854a1 1 0 001.415-1.415l-4.854-4.853A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

SearchButton.displayName = 'SearchButton';

export default SearchButton;

