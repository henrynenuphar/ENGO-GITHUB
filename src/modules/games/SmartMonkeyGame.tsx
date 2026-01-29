import React, { useState, useEffect } from 'react'
import { GameContainer } from './components/GameContainer'
import { Vocabulary } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Clock } from 'lucide-react'
import mascotImg from '@/assets/images/mascot_new.png'

interface SmartMonkeyGameProps {
    data: {
        words: Vocabulary[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

interface RoundData {
    target: Vocabulary
    options: Vocabulary[]
}

const SmartMonkeyGame: React.FC<SmartMonkeyGameProps> = ({ data, onComplete, onExit }) => {
    // Game Constants
    const ROUND_DURATION = 600 // 10 minutes

    // State
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
    const [isPaused, setIsPaused] = useState(false)
    const [gameEnded, setGameEnded] = useState(false)

    // Game Logic
    const [beltWords, setBeltWords] = useState<Vocabulary[]>([])
    const [target, setTarget] = useState<Vocabulary | null>(null)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    // Setup
    useEffect(() => {
        initGame()
    }, [])

    // Timer
    useEffect(() => {
        if (isPaused || gameEnded) return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    endGame()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [isPaused, gameEnded])

    const initGame = () => {
        if (!data?.words || data.words.length === 0) return

        // Create a long belt of words (repeat 3 times for smooth loop)
        const shuffled = [...data.words].sort(() => Math.random() - 0.5)
        setBeltWords(shuffled)

        setScore(0)
        setTimeLeft(ROUND_DURATION)
        setGameEnded(false)

        pickNewTarget(shuffled)
    }

    const pickNewTarget = (words: Vocabulary[]) => {
        const random = words[Math.floor(Math.random() * words.length)]
        setTarget(random)
    }

    const endGame = () => {
        setGameEnded(true)
    }

    const handleSignClick = (word: Vocabulary) => {
        if (isPaused || gameEnded || !target) return

        if (word.id === target.id) {
            // Correct
            setScore(prev => prev + 10)
            setMessage({ text: "Correct!", type: 'success' })
            playSound('correct')

            // Pick new target immediately
            const others = beltWords.filter(w => w.id !== word.id)
            const next = others[Math.floor(Math.random() * others.length)] || target
            setTarget(next)

            setTimeout(() => {
                setMessage(null)
            }, 1000)
        } else {
            // Wrong
            setScore(prev => Math.max(0, prev - 2))
            setMessage({ text: "Sai rồi!", type: 'error' })
            playSound('wrong')
            setTimeout(() => {
                setMessage(null)
            }, 1000)
        }
    }

    const playSound = (type: 'correct' | 'wrong') => {
        const url = type === 'correct'
            ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
            : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'
        const audio = new Audio(url)
        audio.volume = 0.5
        audio.play().catch(() => { })
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    if (gameEnded) {
        return (
            <div className="fixed inset-0 bg-brand-lightBlue flex flex-col items-center justify-center p-8 z-[100]">
                <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-yellow-400 text-center max-w-sm w-full animate-in zoom-in">
                    <h2 className="text-3xl font-black text-slate-800 mb-4">Hoàn thành!</h2>
                    <p className="text-xl text-slate-600 mb-2">Điểm của bạn</p>
                    <p className="text-6xl font-black text-brand-orange mb-8">{score}</p>
                    <button onClick={() => onComplete(score)} className="w-full bg-brand-orange text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:bg-orange-600 transition-colors">
                        Tiếp tục
                    </button>
                </div>
            </div>
        )
    }

    // Display list for loop (doubled)
    const displayList = [...beltWords, ...beltWords, ...beltWords]

    return (
        <GameContainer
            title="Smart Monkey"
            score={score}
            isPaused={isPaused}
            setIsPaused={setIsPaused}

            onRestart={initGame}
            onExit={onExit}
        >
            <div className="h-full w-full relative overflow-hidden bg-[#e0f7fa] font-comic select-none flex flex-col">
                {/* --- BACKGROUND LAYERS --- */}
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-300 rounded-full opacity-50 blur-2xl z-0" />

                {/* Jungle Tree Top Branch */}
                <div className="absolute top-0 left-0 w-full h-8 bg-amber-900/80 z-20 shadow-md">
                    <div className="absolute -bottom-4 left-0 w-full h-8 flex justify-between px-4">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="w-12 h-12 bg-green-600 rounded-full -mt-6 opacity-90 shadow-sm" />
                        ))}
                    </div>
                </div>

                {/* --- INFO HEADER --- */}
                <div className="absolute top-16 left-4 z-50 flex items-center gap-4">
                    <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-500 rounded-xl px-4 py-2 shadow-lg flex items-center gap-3">
                        <Clock size={20} className="text-amber-600" />
                        <span className="font-mono font-bold text-xl text-amber-900">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="absolute top-16 right-4 z-50">
                    <div className="bg-brand-orange text-white rounded-xl px-4 py-2 shadow-lg border-2 border-orange-400 font-bold text-xl">
                        {score} pts
                    </div>
                </div>

                {/* --- CONVEYOR BELT AREA --- */}
                <div className="flex-1 w-full flex flex-col relative z-30 pt-8 md:pt-12">
                    <div className="w-full h-[60%] relative overflow-hidden flex items-start">
                        {/* Moving Track */}
                        <motion.div
                            className="flex gap-16 pl-16 absolute top-0 left-0"
                            animate={{ x: [0, -2000] }}
                            transition={{
                                repeat: Infinity,
                                duration: 45, // Speed of conveyor
                                ease: "linear"
                            }}
                        >
                            {displayList.map((word, idx) => (
                                <div key={`${word.id}-${idx}`} className="relative flex flex-col items-center group flex-shrink-0">
                                    {/* Long Rope */}
                                    <div className="w-1 h-24 md:h-32 bg-amber-800/80" />

                                    {/* Sign Board */}
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 3 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSignClick(word)}
                                        className={`
                                            relative w-40 h-28 bg-[#ffcc80] border-4 border-[#e65100] 
                                            rounded-lg shadow-xl flex items-center justify-center p-2
                                            hover:bg-[#ffe0b2] transition-colors
                                        `}
                                    >
                                        {/* Nail */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-400 border border-slate-600 z-10" />

                                        <span className="text-xl font-bold text-[#3e2723] text-center leading-tight break-words">
                                            {word.word}
                                        </span>
                                    </motion.button>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* MONKEY AREA */}
                    <div className="flex-1 w-full flex items-end justify-center pb-0 relative">
                        {/* Grass Floor */}
                        <div className="absolute bottom-0 w-full h-8 bg-green-500 border-t-4 border-green-600" />

                        {/* Mascot & Board */}
                        <div className="relative flex flex-col items-center mb-4">
                            {/* Feedback Message Bubble */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0, y: 50 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className={`
                                            absolute -top-16 bg-white px-4 py-2 rounded-2xl border-4 shadow-lg whitespace-nowrap z-50
                                            ${message.type === 'success' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-500'}
                                        `}
                                    >
                                        <span className="font-black text-lg">{message.text}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Target Board using Image */}
                            <div className="relative z-20 -mb-8 transform -rotate-2 origin-bottom-right">
                                <div className="w-48 h-36 md:w-64 md:h-48 bg-white rounded-xl border-[6px] border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-2 relative">
                                    <div className="absolute top-2 w-full text-center">
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Find this word</span>
                                    </div>
                                    {target && (
                                        <>
                                            {target.image.startsWith('http') ? (
                                                <img
                                                    src={target.image}
                                                    className="w-full h-full object-contain"
                                                    alt="target"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.querySelector('.fallback-text')!.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-6xl">{target.image}</span>
                                            )}
                                            {/* Fallback Text for Image Error */}
                                            <span className="fallback-text hidden text-xl font-bold text-slate-700 text-center absolute inset-0 flex items-center justify-center">
                                                {target.meaning}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Monkey Image */}
                            <img
                                src={mascotImg}
                                alt="Monkey"
                                className="w-40 md:w-52 object-contain relative z-10 transform translate-x-12"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </GameContainer>
    )
}

export default SmartMonkeyGame
