import React, { useState, useEffect } from 'react'
import { GameContainer } from './components/GameContainer'
import { Question } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import { GameReview, ReviewItem } from './components/GameReview'
import { GameResult } from './components/GameResult'
import bgImg from '@/assets/images/stadium_bg_cartoon.png'
import goalImg from '@/assets/images/soccer_goal_transparent.png'
import keeperImg from '@/assets/images/khi_chup_bong_transparent.png'
import ballImg from '@/assets/images/soccer_ball.png'

interface DefeatTheGoalkeeperGameProps {
    data: {
        questions: Question[]
    }
    onComplete: (score: number) => void
    onExit: () => void
}

const DefeatTheGoalkeeperGame: React.FC<DefeatTheGoalkeeperGameProps> = ({ data, onComplete, onExit }) => {
    const QUESTIONS_COUNT = 10

    // State
    const [score, setScore] = useState(0)
    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [gameStatus, setGameStatus] = useState<'intro' | 'playing' | 'scored' | 'missed' | 'review' | 'finished'>('intro')
    // Store the index of the selected answer to determine direction
    const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null)
    const [userAnswers, setUserAnswers] = useState<{ question: Question, selectedIdx: number, isCorrect: boolean }[]>([])
    const [isMuted, setIsMuted] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [timeLeft, setTimeLeft] = useState(20 * 60)

    const currentQuestion = data.questions[currentQIndex]

    // Timer
    useEffect(() => {
        if (gameStatus !== 'playing') return
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [gameStatus])

    // Background Audio
    const bgMusicRef = React.useRef<HTMLAudioElement | null>(null)
    const [hasInteracted, setHasInteracted] = useState(false)

    useEffect(() => {
        bgMusicRef.current = new Audio('/sounds/fun_bg_jungle_user.mp4')
        bgMusicRef.current.loop = true
        bgMusicRef.current.volume = 0.4

        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause()
                bgMusicRef.current.currentTime = 0
            }
        }
    }, [])

    useEffect(() => {
        const playMusic = () => {
            if (!isPaused && bgMusicRef.current && gameStatus !== 'finished' && gameStatus !== 'review' && hasInteracted) {
                bgMusicRef.current.play().catch(e => console.log("Audio autoplay blocked", e))
            } else if (bgMusicRef.current) {
                bgMusicRef.current.pause()
            }
        }

        if (!isMuted) {
            playMusic()
        } else if (bgMusicRef.current) {
            bgMusicRef.current.pause()
        }
    }, [isPaused, isMuted, gameStatus, hasInteracted])

    // SFX
    const playSound = (type: 'kick' | 'goal' | 'whistle' | 'cheer' | 'miss') => {
        if (isMuted) return
        const sounds = {
            kick: 'https://assets.mixkit.co/active_storage/sfx/2103/2103-preview.mp3',
            goal: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
            whistle: 'https://assets.mixkit.co/active_storage/sfx/2099/2099-preview.mp3',
            cheer: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3',
            miss: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'
        }
        new Audio(sounds[type]).play().catch(() => { })
    }

    const handleStart = () => {
        playSound('whistle')
        setGameStatus('playing')
    }

    const handleAnswer = (index: number) => {
        if (gameStatus !== 'playing') return
        setSelectedAnswerIdx(index)

        const isCorrect = index === currentQuestion.correctIndex

        // Wait for animation triggers
        playSound('kick')

        if (isCorrect) {
            setTimeout(() => playSound('goal'), 600)
            setTimeout(() => playSound('cheer'), 800)
            setGameStatus('scored')
            setScore(prev => prev + 10)
        } else {
            setTimeout(() => playSound('miss'), 600)
            setGameStatus('missed')
            setScore(prev => Math.max(0, prev - 5))
        }

        const newHistory = [...userAnswers, { question: currentQuestion, selectedIdx: index, isCorrect }]
        setUserAnswers(newHistory)

        setTimeout(() => {
            if (currentQIndex < QUESTIONS_COUNT - 1) {
                setCurrentQIndex(prev => prev + 1)
                setSelectedAnswerIdx(null)
                setGameStatus('playing')
            } else {
                setGameStatus('review')
            }
        }, 2500)
    }

    // --- Directional Logic ---
    const SHOOT_TARGETS = [
        { x: -180, y: -200 }, // A: Top-Left
        { x: 180, y: -200 },  // B: Top-Right
        { x: -180, y: -100 }, // C: Bottom-Left
        { x: 180, y: -100 },  // D: Bottom-Right
    ]

    // --- Animations ---
    const ballVariants = {
        initial: { x: 0, y: 0, scale: 1, rotate: 0 },
        scored: (idx: number) => ({
            x: SHOOT_TARGETS[idx]?.x || 0,
            y: SHOOT_TARGETS[idx]?.y || -250,
            scale: 0.5,
            rotate: 720,
            transition: { duration: 0.6, ease: "easeOut" }
        }),
        missed: (idx: number) => {
            const tgt = SHOOT_TARGETS[idx] || { x: 0, y: -250 };
            return {
                x: 0, // Ball goes straight to the center for a clean catch
                y: tgt.y * 0.8,
                scale: 0.6,
                rotate: 180,
                transition: { duration: 0.45, ease: "easeOut" }
            };
        }
    }

    const keeperVariants = {
        idle: { y: [0, -5, 0], scale: 1, transition: { repeat: Infinity, duration: 1.5 } },
        dive: (custom: { isGoal: boolean, idx: number }) => {
            const target = SHOOT_TARGETS[custom.idx] || { x: 0, y: 0 }

            if (custom.isGoal) {
                // Dive WRONG way or don't reach (Opposite X direction)
                return {
                    x: target.x > 0 ? -120 : 120, // Jump to the opposite side
                    y: 30,
                    rotate: target.x > 0 ? -25 : 25,
                    transition: { type: "spring", stiffness: 200 }
                }
            } else {
                // Dive TO intercept the ball (Center Catch)
                return {
                    x: 0,
                    y: 10, // Move slightly forward
                    scale: 1.1, // Puff up chest to catch
                    rotate: 0, // Stay upright
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                }
            }
        }
    }

    // --- Playing Screen ---
    if (gameStatus === 'playing' || gameStatus === 'scored' || gameStatus === 'missed') {
        return (
            <GameContainer title="Penalty Shootout" score={score} onExit={onExit} isPaused={isPaused} setIsPaused={setIsPaused} hideHeader hideScore>
                <div className="absolute inset-0 flex flex-col font-sans overflow-hidden select-none bg-sky-300" onClick={() => setHasInteracted(true)}>
                    {/* Background Layer (Sharp Assets) */}
                    <div className="absolute inset-0 z-0 bg-cover bg-bottom" style={{ backgroundImage: `url(${bgImg})` }} />

                    {/* Exit Button */}
                    <button
                        onClick={onExit}
                        className="absolute top-4 left-4 z-50 w-12 h-12 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg active:scale-90 transition-transform cursor-pointer"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>

                    {/* Question Banner (Simple Black Theme matching screenshot) */}
                    <div className="w-full flex justify-center pt-2 md:pt-4 z-40 relative px-16">
                        <motion.div
                            key={currentQIndex} initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1a1f2c] border-[3px] border-[#3b4b6b] rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.6)] px-8 py-4 md:py-6 w-full max-w-4xl flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
                        >
                            {/* Inner highlight */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 rounded-t-xl" />
                            <h2 className="text-white font-black text-xl md:text-2xl lg:text-3xl text-center font-sans tracking-wide leading-snug w-full relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                {currentQuestion.text}
                            </h2>
                        </motion.div>
                    </div>

                    {/* Stats Panel (Left under banner) */}
                    <div className="absolute top-24 md:top-28 left-4 md:left-6 z-40 pointer-events-none">
                        <div className="flex bg-black/80 rounded-lg overflow-hidden border-2 border-green-500 shadow-lg min-w-[150px]">
                            {/* Avatar Area */}
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#a3e635] flex items-center justify-center border-r-2 border-green-500">
                                <span className="text-2xl md:text-3xl text-white drop-shadow-sm">👤</span>
                            </div>
                            {/* Score/Q Info */}
                            <div className="flex flex-col justify-center px-3 py-1 text-white text-xs md:text-sm font-bold">
                                <div><span className="text-slate-300">Score: </span><span className="text-yellow-400">{score}</span></div>
                                <div><span className="text-slate-300">Question: </span><span className="text-yellow-400">{currentQIndex + 1}/{QUESTIONS_COUNT}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Timer (Right under banner) */}
                    <div className="absolute top-20 md:top-24 right-4 md:right-8 z-40 pointer-events-none">
                        <div className="font-mono font-black text-white text-3xl md:text-5xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-text-black">
                            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                    </div>



                    {/* Game Area (Keeper & Ball & Goal) */}
                    <div className="flex-1 relative z-30 w-full max-w-5xl mx-auto pointer-events-none">
                        {/* Goal Post (Pro AI Extracted & Transparent) */}
                        <div className="absolute left-1/2 bottom-[33%] -translate-x-1/2 w-[95%] md:w-[85%] z-10 opacity-100">
                            <img src={goalImg} alt="Goal" className="w-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] filter contrast-110" />
                        </div>

                        {/* Keeper */}
                        <div className="absolute left-1/2 bottom-[35%] -translate-x-1/2 z-20 pointer-events-none">
                            <motion.div
                                className="w-[180px] sm:w-[280px] md:w-[350px] lg:w-[480px] origin-bottom"
                                animate={gameStatus === 'playing' ? 'idle' : 'dive'}
                                custom={{ isGoal: gameStatus === 'scored', idx: selectedAnswerIdx || 0 }}
                                variants={keeperVariants}
                            >
                                <img src={keeperImg} alt="Keeper" className="w-full drop-shadow-2xl" />
                            </motion.div>
                        </div>

                        {/* Feedback */}
                        <AnimatePresence>
                            {(gameStatus === 'scored' || gameStatus === 'missed') && (
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] z-50`}
                                >
                                    <h2 className={`text-5xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[0_5px_0_rgba(0,0,0,0.5)] ${gameStatus === 'scored' ? 'text-yellow-400 stroke-text-black' : 'text-rose-500 stroke-text-white'}`}>
                                        {gameStatus === 'scored' ? 'GOAL!' : 'SAVED!'}
                                    </h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Answer Buttons (Hexagon Style Matching Reference) */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute bottom-[2%] md:bottom-[5%] left-1/2 -translate-x-1/2 w-full max-w-5xl h-48 md:h-64">
                            {/* Cartoon Ball - Center Of Answer Matrix */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
                                <motion.div
                                    className="w-24 md:w-[140px] lg:w-[160px]"
                                    initial="initial"
                                    animate={gameStatus === 'playing' ? 'initial' : (gameStatus === 'scored' ? 'scored' : 'missed')}
                                    custom={selectedAnswerIdx || 0}
                                    variants={ballVariants}
                                >
                                    <img src={ballImg} alt="Ball" className="w-full drop-shadow-2xl" />
                                </motion.div>
                            </div>

                            {currentQuestion.options.map((option, idx) => {
                                const positions = [
                                    { left: '2%', top: '5%' },    // A (Top Left)
                                    { right: '2%', top: '5%' },   // B (Top Right)
                                    { left: '2%', bottom: '5%' }, // C (Low Left)
                                    { right: '2%', bottom: '5%' } // D (Low Right)
                                ]
                                const pos = positions[idx]
                                const labels = ['A', 'B', 'C', 'D']

                                // Base colors
                                const isSelected = selectedAnswerIdx === idx
                                const isCorrect = idx === currentQuestion.correctIndex

                                let bgColorClass = 'bg-[#38bdf8]' // Default blue
                                let borderColorClass = 'border-white'

                                if (selectedAnswerIdx !== null) {
                                    if (isSelected && isCorrect) {
                                        bgColorClass = 'bg-[#4ade80]' // Green 
                                        borderColorClass = 'border-white'
                                    } else if (isSelected && !isCorrect) {
                                        bgColorClass = 'bg-[#ef4444]' // Red
                                        borderColorClass = 'border-white'
                                    } else {
                                        bgColorClass = 'bg-[#38bdf8]/50' // Dimmed blue
                                        borderColorClass = 'border-white/50'
                                    }
                                }

                                return (
                                    <motion.button
                                        key={idx} onClick={() => handleAnswer(idx)} disabled={gameStatus !== 'playing'}
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className={`absolute min-w-[240px] md:min-w-[300px] lg:min-w-[360px] h-16 md:h-20 lg:h-24 flex items-center px-4 outline-none pointer-events-auto cursor-pointer transition-colors box-border rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${bgColorClass} border-[4px] border-dashed ${borderColorClass}`}
                                        style={pos}
                                    >
                                        <div className="relative z-10 flex items-center w-full justify-start text-white gap-3 md:gap-4 pl-2">
                                            <span className="font-black text-xl md:text-2xl text-yellow-300 drop-shadow-md bg-black/40 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shrink-0">
                                                {labels[idx]}
                                            </span>
                                            <span className="font-bold text-sm md:text-base lg:text-lg text-left drop-shadow-sm leading-tight line-clamp-2 pr-2">
                                                {option}
                                            </span>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </GameContainer>
        )
    }

    if (gameStatus === 'intro') {
        return (
            <GameContainer title="Penalty Shootout" score={score} onExit={onExit} isPaused={isPaused} setIsPaused={setIsPaused} hideScore hideHeader>
                <div className="absolute inset-0 z-50 bg-sky-300 flex flex-col items-center justify-center font-sans overflow-hidden" onClick={() => setHasInteracted(true)}>
                    <div className="absolute inset-0 bg-cover bg-bottom" style={{ backgroundImage: `url(${bgImg})` }} />
                    {/* Render Goal Post in Background of Intro */}
                    <div className="absolute left-1/2 bottom-[20%] -translate-x-1/2 w-[95%] md:w-[85%] z-0 opacity-100 pointer-events-none">
                        <img src={goalImg} alt="Goal" className="w-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] filter contrast-110" />
                    </div>

                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 bg-white/95 backdrop-blur shadow-2xl rounded-3xl p-8 max-w-md w-[90%] text-center border-b-8 border-sky-600">
                        <img src={keeperImg} alt="Keeper" className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-4 object-contain" />
                        <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2 uppercase drop-shadow-sm leading-tight text-balance">Defeat The Goalkeeper</h1>
                        <p className="text-slate-600 mb-6 font-bold text-lg">Pick a corner to shoot!</p>
                        <Button onClick={handleStart} className="w-full py-4 text-2xl font-black bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-[0_5px_0_rgb(194,65,12)]">START MATCH ▶</Button>
                    </motion.div>
                </div>
            </GameContainer>
        )
    }

    if (gameStatus === 'review') {
        const reviewItems: ReviewItem[] = userAnswers.map(ans => ({
            question: ans.question.text,
            userAnswer: ans.question.options[ans.selectedIdx],
            correctAnswer: ans.question.options[ans.question.correctIndex],
            isCorrect: ans.isCorrect
        }))
        return <GameReview items={reviewItems} onContinue={() => setGameStatus('finished')} title="Kết quả sút luân lưu" />
    }

    if (gameStatus === 'finished') {
        return <GameResult score={score} maxScore={100} onComplete={() => onComplete(score)} />
    }

    return null
}

export default DefeatTheGoalkeeperGame
