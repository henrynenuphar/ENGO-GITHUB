import React, { useState, useEffect } from 'react'
import { GameContainer } from './components/GameContainer'
import { Question } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { GameReview, ReviewItem } from './components/GameReview'
import { GameResult } from './components/GameResult'
import rowingMonkeyImg from '@/assets/images/rowing_monkey.png'

interface RowingGameProps {
    data: {
        questions: Question[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

const RowingGame: React.FC<RowingGameProps> = ({ data, onComplete, onExit }) => {
    // Randomize and pick 10 questions on mount
    const [gameQuestions] = useState(() => {
        if (!data?.questions) return []
        const shuffled = [...data.questions].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, 10)
    })

    if (!gameQuestions || gameQuestions.length === 0) return <div>No questions loaded</div>

    const [index, setIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [boatState, setBoatState] = useState<'normal' | 'fast' | 'slow'>('normal')
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [phase, setPhase] = useState<'playing' | 'review' | 'result'>('playing')
    const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
    const [hasInteracted, setHasInteracted] = useState(false)

    // Background Audio
    const bgMusicRef = React.useRef<HTMLAudioElement | null>(null)
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
            if (!isPaused && bgMusicRef.current && phase === 'playing' && hasInteracted) {
                bgMusicRef.current.play().catch(e => console.log("Audio autoplay blocked", e))
            } else if (bgMusicRef.current) {
                bgMusicRef.current.pause()
            }
        }
        playMusic()
    }, [isPaused, phase, hasInteracted])

    const currentQuestion = gameQuestions[index]

    if (!currentQuestion) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-sky-200">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                    <h3 className="text-red-500 font-bold text-xl mb-2">Lỗi tải câu hỏi</h3>
                    <p className="text-slate-600 mb-4">Không tìm thấy dữ liệu câu hỏi.</p>
                    <button onClick={onExit} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600">
                        Thoát game
                    </button>
                </div>
            </div>
        )
    }

    const handleAnswer = (optionIndex: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(optionIndex);

        const isCorrect = optionIndex === currentQuestion.correctIndex;

        // Record for review
        setReviewItems(prev => [...prev, {
            question: currentQuestion.text,
            userAnswer: currentQuestion.options[optionIndex],
            correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
            isCorrect
        }])

        if (isCorrect) {
            setScore(prev => prev + 10)
            setBoatState('fast')
            new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3').play().catch(() => { })
        } else {
            setScore(prev => Math.max(0, prev - 5))
            setBoatState('slow')
            new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3').play().catch(() => { })
        }

        setTimeout(() => {
            if (index < gameQuestions.length - 1) {
                setIndex(prev => prev + 1)
                setSelectedOption(null)
                setBoatState('normal')
            } else {
                setPhase('review')
            }
        }, 1500)
    }

    // Progress % for Boat Position (10% to 90%)
    const progress = 10 + ((index / gameQuestions.length) * 80)

    return (
        <GameContainer
            title="Rowing Challenge"
            score={score}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onRestart={() => { setIndex(0); setScore(0); setIsPaused(false); }}
            onExit={onExit}
            hideScore={true}
            hideHeader={true}
        >
            {/* Render End Screens over everything else if not playing */}
            {phase === 'review' && (
                <GameReview items={reviewItems} onContinue={() => setPhase('result')} />
            )}
            {phase === 'result' && (
                <GameResult score={score} maxScore={100} onComplete={() => onComplete(score)} />
            )}

            <div className={`h-full w-full relative overflow-hidden font-sans select-none bg-[#4FC3F7] ${phase !== 'playing' ? 'hidden' : ''}`} onClick={() => setHasInteracted(true)}>

                {/* --- BACKGROUND LAYER --- */}
                {/* Full screen background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: "url('/images/rowing_bg.png')" }}
                />

                {/* --- GAMEPLAY LAYER --- */}
                {/* Boat Lane - Positioned to align with water in background */}
                <div className="absolute bottom-[20%] w-full h-32 z-10">
                    <motion.div
                        className="absolute top-0 transition-all duration-1000 ease-in-out w-40 md:w-56"
                        animate={{ left: `${progress}%` }}
                        style={{ marginLeft: '-100px' }} // Center anchor
                    >
                        <motion.img
                            src={rowingMonkeyImg}
                            alt="Monkey Rower"
                            animate={{
                                y: [0, 4, 0],
                                rotate: boatState === 'fast' ? [-1, 1, -1] : [-1, 0, -1],
                                scale: boatState === 'fast' ? 1.1 : 1
                            }}
                            transition={{ repeat: Infinity, duration: boatState === 'fast' ? 0.5 : 1.5 }}
                            className="w-full h-auto drop-shadow-xl filter"
                        />
                        {/* Ripple */}
                        <div className="absolute -bottom-2 left-1/4 w-1/2 h-2 bg-white/40 rounded-full blur-sm animate-pulse" />
                    </motion.div>
                </div>


                {/* --- UI OVERLAY --- */}

                {/* Top Left: Exit Button and Progress Circle */}
                <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
                    <button
                        onClick={onExit}
                        className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border border-white/50 shadow-md flex items-center justify-center text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>

                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex flex-col items-center justify-center shadow-lg relative group overflow-hidden">
                        <div className="absolute inset-0 bg-sky-400 opacity-80" />
                        <span className="relative z-10 text-2xl font-black text-white leading-none">{index + 1}</span>
                        <span className="relative z-10 text-[10px] font-bold text-white/80 leading-none">/{gameQuestions.length}</span>
                    </div>
                </div>

                {/* Top Right: Stats Panel (Simplified) */}
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <div className="bg-[#1e3a8a]/90 text-white rounded-2xl p-3 px-6 border-2 border-[#60a5fa] shadow-xl flex flex-col items-center min-w-[120px]">
                        <div className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">Score</div>
                        <div className="text-4xl font-black text-[#a3e635] leading-none drop-shadow-md">{score}</div>
                    </div>
                </div>

                {/* --- QUESTION AREA (Centered Top) --- */}
                {/* --- QUESTION AREA (Centered Top) --- */}
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] z-40">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentQuestion.id}
                        className="bg-[#fed700] rounded-[2rem] p-6 shadow-[0_8px_0_rgb(234,179,8)] border-4 border-white relative"
                    >
                        {/* Instruction Text */}
                        <div className="text-center mb-2">
                            <span className="text-[#0284c7] font-bold text-lg md:text-xl font-sans">Choose the correct answer:</span>
                        </div>
                        {/* Question Content */}
                        <h2 className="text-2xl md:text-4xl font-black text-[#5b21b6] text-center drop-shadow-sm">
                            {currentQuestion.text}
                        </h2>

                        {/* Side Decorations */}
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-white/20 rounded-full blur-xl" />
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-white/20 rounded-full blur-xl" />
                    </motion.div>
                </div>

                {/* --- ANSWERS (Floating Buoys) --- */}
                <div className="absolute bottom-[32%] md:bottom-[38%] w-full px-4 z-40">
                    <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                        {currentQuestion.options.map((option, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedOption !== null}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    relative px-8 py-6 md:px-10 md:py-8 min-w-[160px] md:min-w-[220px]
                                    rounded-3xl shadow-2xl font-black text-xl md:text-2xl transition-all border-b-8
                                    flex flex-col items-center justify-center group
                                    ${selectedOption === null
                                        ? 'bg-white text-[#00695c] border-[#4db6ac] hover:bg-[#e0f2f1]'
                                        : idx === currentQuestion.correctIndex
                                            ? 'bg-[#4ade80] text-white border-[#15803d]'
                                            : idx === selectedOption
                                                ? 'bg-[#ef4444] text-white border-[#b91c1c]'
                                                : 'bg-white/50 text-[#00695c]/50 border-transparent'
                                    }
                                `}
                            >
                                {/* Buoy Ring Visual */}
                                <div className={`
                                     absolute inset-0 rounded-3xl border-4
                                     ${selectedOption === null ? 'border-[#80cbc4]' : 'border-transparent'}
                                     opacity-50 pointer-events-none
                                 `} />

                                {option}

                                {/* Side markers (buoy detail) */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-1.5 bg-sky-200 rounded-l-full" />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* --- BOTTOM PROGRESS BAR (SEGMENTED TRACK) --- */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] z-50">
                    <div className="relative w-full h-12 flex items-center">
                        {/* Track Line */}
                        <div className="absolute left-0 w-full h-3 bg-white/40 backdrop-blur rounded-full border-2 border-white/50" />

                        {/* Start/Finish Labels */}
                        <div className="absolute -top-4 left-0 text-[10px] font-black text-white bg-blue-500 px-1 rounded">START</div>
                        <div className="absolute -top-4 right-0 text-[10px] font-black text-white bg-red-500 px-1 rounded">FINISH</div>

                        {/* Milestones Segments */}
                        <div className="absolute w-full flex justify-between px-1">
                            {gameQuestions.map((_, i) => (
                                <div key={i} className="relative flex items-center justify-center">
                                    {/* Dot */}
                                    <div className={`
                                        w-3 h-3 rounded-full border-2 border-white transition-all
                                        ${i < index ? 'bg-yellow-400 scale-110' : (i === index ? 'bg-white animate-pulse' : 'bg-white/30')}
                                    `} />
                                </div>
                            ))}
                            {/* Finish Flag Node */}
                            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                                <span className="text-[8px]">🏁</span>
                            </div>
                        </div>

                        {/* Moving Character Head */}
                        <motion.div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                            animate={{ left: `${(index / gameQuestions.length) * 100}%` }}
                            transition={{ type: "spring", stiffness: 100 }}
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-sky-200 overflow-hidden shadow-lg relative">
                                <img src={rowingMonkeyImg} className="w-full h-full object-cover scale-150 translate-y-1" alt="mini-avatar" />
                            </div>
                            {/* Speech Bubble Position */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-md shadow text-[10px] whitespace-nowrap font-bold text-sky-600">
                                {index + 1} / {gameQuestions.length}
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </GameContainer>
    )
}

export default RowingGame
