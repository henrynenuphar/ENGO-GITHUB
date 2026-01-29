import React from 'react'
import { cn } from '@/components/ui/Button'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    variant?: 'default' | 'glass' | 'interactive'
}

export const Card = ({ children, className, variant = 'default', ...props }: CardProps) => {
    const variants = {
        default: 'bg-white border border-slate-100 shadow-sm',
        glass: 'bg-white/80 backdrop-blur-md border border-white/50 shadow-lg',
        interactive: 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer'
    }

    return (
        <div className={cn('rounded-3xl p-6', variants[variant], className)} {...props}>
            {children}
        </div>
    )
}
