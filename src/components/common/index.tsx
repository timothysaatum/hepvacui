import React from 'react';
import { cn } from '../../utils/cn';

// ── LoadingSpinner ────────────────────────────────────────────────────────────

export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center justify-center py-16', className)}>
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
    );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {icon && (
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                    {icon}
                </div>
            )}
            <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// ── FormField ─────────────────────────────────────────────────────────────────

interface FormFieldProps {
    label: string;
    htmlFor?: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormField({ label, htmlFor, error, required, hint, children, className }: FormFieldProps) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

// ── Input / Select / Textarea — styled variants ───────────────────────────────

const inputBase =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={cn(inputBase, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select {...props} className={cn(inputBase, 'appearance-none cursor-pointer', props.className)} />
    );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            rows={3}
            {...props}
            className={cn(inputBase, 'resize-none', props.className)}
        />
    );
}

// ── PageHeader ────────────────────────────────────────────────────────────────

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
    );
}

// ── SectionCard ────────────────────────────────────────────────────────────────

interface SectionCardProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function SectionCard({ title, subtitle, action, children, className }: SectionCardProps) {
    return (
        <div className={cn('bg-white rounded-2xl border border-slate-200 shadow-sm', className)}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}
