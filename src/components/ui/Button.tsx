import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-brand-blue text-white hover:bg-brand-darkBlue shadow-lg shadow-brand-blue/30',
            secondary: 'bg-brand-orange text-white hover:bg-orange-600 shadow-md',
            outline: 'border-2 border-brand-blue text-brand-blue hover:bg-brand-lightBlue',
            ghost: 'hover:bg-brand-lightBlue text-slate-600',
            danger: 'bg-red-500 text-white hover:bg-red-600',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-xl',
            md: 'px-6 py-3 text-base rounded-2xl',
            lg: 'px-8 py-4 text-lg font-bold rounded-3xl',
        }

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)
