import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-raqaba-600 text-white shadow-lg shadow-raqaba-600/25 hover:bg-raqaba-700',
    secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700'
  }[variant];

  return (
    <button
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
        styles,
        className
      )}
      {...props}
    />
  );
}
