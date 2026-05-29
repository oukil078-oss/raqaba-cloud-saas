import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDzd = (value: number | string) => {
  return `${Number(value || 0).toFixed(2)} دج`;
};

export const formatDate = (value: string | Date) => {
  return String(value);
};
