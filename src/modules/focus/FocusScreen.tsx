import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mascot } from '@/components/common/Mascot'
import { Play, Pause, RefreshCw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const FocusScreen = () => {
    const navigate = useNavigate()
    const [isActive, setIsActive] = useState(false)
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
    const [mode, setMode] = useState<'focus' | 'break'>('focus')

    useEffect(() => {
        let interval: any = null
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            // Switch mode logic would go here
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft])

    const toggleTimer = () => setIsActive(!isActive)
    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center relative z-50">

            {/* Header */}
            <div className="w-full flex justify-between items-center mb-10">
                <h1 className="font-bold text-xl flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Focus Mode
                </h1>
                <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                    <X size={20} />
                </button>
            </div>

            {/* Main Timer Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">

                <div className="relative mb-12">
                    {/* Circular Progress (CSS based for simplicity) */}
                    <div className="w-72 h-72 rounded-full border-8 border-white/10 flex items-center justify-center relative">
                        <motion.div
                            animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 border-8 border-brand-blue rounded-full opacity-50"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
                        ></motion.div>

                        <div className="flex flex-col items-center z-10">
                            <span className="text-6xl font-bold font-mono tracking-wider mb-4">{formatTime(timeLeft)}</span>
                            <span className="text-brand-blue uppercase tracking-widest text-sm font-bold">{mode}</span>
                        </div>
                    </div>

                    {/* Mascot Overlay */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <Mascot mood={isActive ? 'focus' : 'happy'} size="md" />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 mt-8">
                    <button
                        onClick={toggleTimer}
                        className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-brand-blue/30"
                    >
                        {isActive ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} className="ml-1" />}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <RefreshCw size={24} />
                    </button>
                </div>

            </div>

            <p className="text-slate-500 text-sm mt-8">Stay focused! The penguin is watching.</p>
        </div>
    )
}

export default FocusScreen
