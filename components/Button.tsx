import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'stone';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
    outline: "bg-transparent border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300",
    // Pharaonic Stone Style: Sandstone gradient (Amber/Orange), Dark Brown Text, Highlighted Top Border
    stone: "bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 text-amber-950 border-t-2 border-amber-100 shadow-xl shadow-black/50 hover:from-amber-100 hover:via-amber-300 hover:to-amber-500 ring-4 ring-amber-900/40"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};