import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Pause, Play, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AnimatePresence, motion } from 'framer-motion'

interface GameContainerProps {
    title: string
    children: React.ReactNode
    score: number
    onExit?: () => void
    onRestart?: () => void
    isPaused: boolean
    setIsPaused: (val: boolean) => void
    headerContent?: React.ReactNode
    hideScore?: boolean
    hideHeader?: boolean
}

export const GameContainer = ({
    title,
    children,
    score,
    onExit,
    onRestart,
    isPaused,
    setIsPaused,
    headerContent,
    hideScore,
    hideHeader
}: GameContainerProps) => {
    const navigate = useNavigate()

    const handleExit = () => {
        if (onExit) {
            onExit()
        } else {
            navigate('/app/games')
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex justify-center bg-brand-lightBlue">
            <div className="w-full max-w-md h-full flex flex-col bg-white shadow-2xl relative overflow-hidden">
                {/* Game Header */}
                {!hideHeader && (
                    <div className="h-16 bg-white/10 flex items-center justify-between px-4 backdrop-blur-md shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsPaused(!isPaused)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
                                {isPaused ? <Play size={24} /> : <Pause size={24} />}
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-white font-bold text-lg leading-tight">{title}</h1>
                                {headerContent && <div className="text-white/80 text-xs">{headerContent}</div>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {!hideScore && (
                                <div className="px-4 py-1 bg-brand-orange rounded-full text-white font-bold border-2 border-white/20 shadow-lg min-w-[100px] text-center">
                                    {score} pts
                                </div>
                            )}
                            <button onClick={handleExit} className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Content */}
                <div className="flex-1 relative overflow-hidden bg-brand-lightBlue">
                    {children}
                </div>

                {/* Pause Overlay */}
                <AnimatePresence>
                    {isPaused && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <Card className="w-80 p-8 flex flex-col items-center gap-6">
                                <h2 className="text-2xl font-bold text-slate-800">Game Paused</h2>
                                <div className="flex flex-col w-full gap-3">
                                    <Button onClick={() => setIsPaused(false)} variant="primary" size="lg" className="w-full">
                                        Resume
                                    </Button>
                                    <Button onClick={onRestart} variant="secondary" size="lg" className="w-full">
                                        Restart
                                    </Button>
                                    <Button onClick={handleExit} variant="outline" size="lg" className="w-full border-red-200 text-red-500 hover:bg-red-50">
                                        Quit Game
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
