import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = 'px-4 py-2 text-sm font-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105';
  
  const variantClasses = {
    primary: 'text-white bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 border border-transparent',
    secondary: 'text-slate-700 bg-white hover:bg-slate-50 focus:ring-orange-500 border border-slate-300',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 border border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;