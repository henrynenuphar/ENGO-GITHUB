import React from 'react'
import { motion } from 'framer-motion'

export type MascotMood = 'happy' | 'focus' | 'sleep' | 'cheer' | 'confused'

interface MascotProps {
    mood?: MascotMood
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

import mascotImg from '@/assets/images/mascot_new.png'

export const Mascot = ({ mood = 'happy', size = 'md', className }: MascotProps) => {
    // Simple CSS shapes to represent a penguin for now, replaced with SVG/Image later

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-32 h-32',
        lg: 'w-64 h-64',
    }

    // Animation variants
    const variants = {
        happy: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } },
        cheer: { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.5 } },
        focus: { scale: 1.05, transition: { duration: 0.5 } },
        sleep: { opacity: 0.8, y: 5 },
        confused: { rotate: [0, -5, 5, 0], transition: { duration: 1 } }
    }

    return (
        <motion.div
            className={`relative ${sizeClasses[size]} ${className}`}
            animate={mood}
            variants={variants}
        >
            <img
                src={mascotImg}
                alt="Mascot"
                className="w-full h-full object-contain filter drop-shadow-lg"
            />


            {/* Dialogue Bubble (Optional) */}
            {mood === 'cheer' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 -right-10 bg-white p-2 rounded-xl rounded-bl-none shadow-md border-2 border-brand-blue text-xs font-bold"
                >
                    Great Job!
                </motion.div>
            )}
        </motion.div>
    )
}
