import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const formatDzd = (value: number | string) => `${Number(value || 0).toLocaleString('fr-DZ')} دج`;
export const formatDate = (value: string | Date) => new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium' }).format(new Date(value));
