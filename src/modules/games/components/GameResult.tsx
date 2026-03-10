import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Sparkles, ChevronRight } from 'lucide-react'
import { Mascot } from '@/components/common/Mascot'
import { Button } from '@/components/ui/Button'

interface GameResultProps {
    score: number
    maxScore?: number
    onComplete: () => void
    title?: string
    message?: string
}

export const GameResult: React.FC<GameResultProps> = ({
    score,
    maxScore = 30,
    onComplete,
    title = "Tuyệt vời!",
    message = "Con đã hoàn thành trò chơi rất xuất sắc. Giỏi quá!"
}) => {
    // Calculate stars based on ratio
    const ratio = maxScore > 0 ? score / maxScore : 0
    let stars = 0
    if (ratio >= 0.8) stars = 3
    else if (ratio >= 0.5) stars = 2
    else if (ratio > 0) stars = 1
    const [confetti, setConfetti] = useState<{ x: number, y: number, color: string, delay: number, dur: number }[]>([])

    useEffect(() => {
        if (stars > 0) {
            const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-purple-400']
            const pieces = Array.from({ length: 40 }).map(() => ({
                x: Math.random() * 100,
                y: -20 - Math.random() * 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 1.5,
                dur: 2 + Math.random() * 2
            }))
            setConfetti(pieces)
        }
    }, [stars])

    return (
        <div className="absolute inset-0 z-[100] bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
            {/* Confetti Background */}
            {stars > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {confetti.map((c, i) => (
                        <div
                            key={i}
                            className={`absolute w-4 h-4 rounded-sm ${c.color} opacity-80`}
                            style={{
                                left: `${c.x}%`,
                                top: `${c.y}%`,
                                animation: `fall ${c.dur}s linear ${c.delay}s infinite`
                            }}
                        />
                    ))}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes fall {
                            0% { transform: translateY(-10vh) rotate(0deg) scale(0.8); opacity: 1; }
                            100% { transform: translateY(110vh) rotate(720deg) scale(1.2); opacity: 0; }
                        }
                    `}} />
                </div>
            )}

            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15, delay: 0.1 }}
                className="z-10 bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-8 border-white w-full max-w-lg flex flex-col items-center p-8 sm:p-12 text-center relative"
            >
                {/* Header Decoration */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl transform scale-150 animate-pulse" />
                    <Mascot mood={stars >= 2 ? "cheer" : "happy"} size="lg" className="relative z-10" />

                    {/* Star Badge */}
                    <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-2 shadow-xl border-4 border-yellow-100 flex items-center justify-center">
                        <Trophy size={32} className="text-yellow-500" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-800 mb-2">{title}</h2>
                <p className="text-slate-500 font-medium mb-8">
                    {message}
                </p>

                {/* Score Summary Box */}
                <div className="w-full bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 shadow-inner mb-8 flex justify-between items-center relative overflow-hidden">
                    {/* Pattern Overlay */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-xl -mr-10 -mt-10" />

                    <div className="flex flex-col items-start relative z-10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Điểm đạt được</span>
                        <div className="text-4xl font-black text-brand-blue drop-shadow-sm">{score}</div>
                    </div>

                    <div className="flex gap-1 relative z-10">
                        {[1, 2, 3].map((starIdx) => (
                            <motion.div
                                key={starIdx}
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.5 + (starIdx * 0.2), type: "spring" }}
                            >
                                <Star
                                    size={36}
                                    className={`
                                        transition-colors duration-500 
                                        ${stars >= starIdx
                                            ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-md'
                                            : 'text-slate-200 fill-slate-200'
                                        }
                                    `}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={onComplete}
                    className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black text-lg shadow-lg shadow-green-500/30 rounded-2xl hover:scale-105 active:scale-95 transition-all outline-none"
                >
                    NHẬN THƯỞNG <Sparkles size={20} className="ml-2" />
                </Button>
            </motion.div>
        </div>
    )
}
