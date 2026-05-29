import * as React from 'react';
import { cn } from '@/lib/utils';
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={cn('h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-raqaba-500 focus:ring-4 focus:ring-raqaba-500/10', props.className)} />; }
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={cn('min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-raqaba-500 focus:ring-4 focus:ring-raqaba-500/10', props.className)} />; }
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={cn('h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-raqaba-500 focus:ring-4 focus:ring-raqaba-500/10', props.className)} />; }
export function Label({ children }: { children: React.ReactNode }) { return <label className="mb-2 block text-sm font-bold text-slate-700">{children}</label>; }
