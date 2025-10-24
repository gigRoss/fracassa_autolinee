import React from 'react';

interface CloseIconProps {
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

export const CloseIcon: React.FC<CloseIconProps> = ({
  width = 15,
  height = 15,
  className = '',
  onClick
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 15 15" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <path 
        d="M0.143677 0.143738L14.1437 14.1437" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M13.9969 0L0.29042 14.2874" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CloseIcon;
