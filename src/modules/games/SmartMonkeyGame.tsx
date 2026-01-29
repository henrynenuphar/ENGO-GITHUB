import React, { useState, useEffect, useRef } from 'react'
import { GameContainer } from './components/GameContainer'
import { Vocabulary } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import mascotImg from '@/assets/images/mascot_new.png'

interface SmartMonkeyGameProps {
    data: {
        words: Vocabulary[]
    }
    onComplete: (score: number) => void
    onExit?: () => void
}

const SmartMonkeyGame: React.FC<SmartMonkeyGameProps> = ({ data, onComplete, onExit }) => {
    // Game Constants
    const ROUND_DURATION = 600
    // Speed: pixels per second. Adjust to control difficulty.
    const SPEED_PX_PER_SEC = 50

    // Component Refs
    const monkeyBoardRef = useRef<HTMLDivElement>(null)

    // State
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
    const [isPaused, setIsPaused] = useState(false)
    const [gameEnded, setGameEnded] = useState(false)

    // Game Logic State
    // uniqueId is critical for React lists
    const [beltWords, setBeltWords] = useState<(Vocabulary & { uniqueId: string, matchedPayload?: Vocabulary })[]>([])
    const [targetQueue, setTargetQueue] = useState<Vocabulary[]>([])
    const [currentTarget, setCurrentTarget] = useState<Vocabulary | null>(null)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    // Flying Animation
    const [flyingPayload, setFlyingPayload] = useState<{
        start: { x: number, y: number },
        targetId: string,
        payload: Vocabulary
    } | null>(null)

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

        // 1. Prepare Target Queue (The words the user needs to find)
        // Shuffle completely
        const shuffledTargets = [...data.words].sort(() => Math.random() - 0.5)
        setTargetQueue(shuffledTargets.slice(1))
        setCurrentTarget(shuffledTargets[0])

        // 2. Prepare Belt Items (Infinite Loop Illusion)
        // We need a list that repeats to create a seamless loop.
        // We will take the word list, shuffle it differently for the belt, 
        // to make it "random" and not just the same order as targets.
        // Rule: Belt order should be random check logic.

        let pool = [...data.words]
        // If pool is small, duplicate it to ensure we have enough items for a nice loop
        while (pool.length < 10) {
            pool = [...pool, ...data.words]
        }

        // Shuffle the pool for the belt
        const beltShuffled = [...pool].sort(() => Math.random() - 0.5)

        // Setup for seamless loop: List A + List A.
        // We animate through List A, then instant jump back to 0.
        // Belt = [Item1...ItemN] + [Item1...ItemN]
        const loopList = [...beltShuffled, ...beltShuffled].map((w, i) => ({
            ...w,
            uniqueId: `belt-${i}-${Math.random().toString(36).substr(2, 9)}`
        }))

        setBeltWords(loopList)
        setScore(0)
        setTimeLeft(ROUND_DURATION)
        setGameEnded(false)
    }

    const endGame = () => {
        setGameEnded(true)
    }

    const playSound = (type: 'correct' | 'wrong') => {
        const url = type === 'correct'
            ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
            : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'
        const audio = new Audio(url)
        audio.volume = 0.5
        audio.play().catch(() => { })
    }

    const handleSignClick = (e: React.MouseEvent, beltWord: Vocabulary & { uniqueId: string }) => {
        if (isPaused || gameEnded || !currentTarget || flyingPayload) return

        if (beltWord.id === currentTarget.id) {
            // Correct Match
            playSound('correct')
            setScore(prev => prev + 10)

            // Start Position
            let start = { x: window.innerWidth / 2, y: window.innerHeight - 150 }
            if (monkeyBoardRef.current) {
                const rect = monkeyBoardRef.current.getBoundingClientRect()
                start = { x: rect.left, y: rect.top }
            }

            // Fly Animation
            setFlyingPayload({
                start,
                targetId: beltWord.uniqueId,
                payload: currentTarget
            })

            setCurrentTarget(null)

            // Attach & Next
            setTimeout(() => {
                setBeltWords(prev => prev.map(w =>
                    w.uniqueId === beltWord.uniqueId
                        ? { ...w, matchedPayload: currentTarget! }
                        : w
                ))
                setFlyingPayload(null)

                // Pick next target
                if (targetQueue.length > 0) {
                    const [next, ...rest] = targetQueue
                    setCurrentTarget(next)
                    setTargetQueue(rest)
                } else {
                    setTimeout(endGame, 1500)
                }
            }, 600)

        } else {
            // Wrong
            setScore(prev => Math.max(0, prev - 2))
            setMessage({ text: "Chưa đúng!", type: 'error' })
            playSound('wrong')
            setTimeout(() => {
                setMessage(null)
            }, 1000)
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    // --- ANIMATION CALCULATION ---
    // Item Width: w-44 (11rem = 176px)
    // Gap: gap-32 (8rem = 128px)
    // Total Unit Width: 19rem = 304px (176 + 128)
    const UNIT_WIDTH_REM = 19
    const UNIT_WIDTH_PX = 304 // Approx on standard root font sizing. 
    // Ideally we use REM in animation or percentage, but pixel is safer for loop exactness.
    // Loop Count is half the list (since we doubled it).
    const loopCount = beltWords.length / 2
    const totalLoopDistance = loopCount * UNIT_WIDTH_PX
    const animationDuration = totalLoopDistance / SPEED_PX_PER_SEC

    if (gameEnded) {
        return (
            <div className="fixed inset-0 bg-brand-lightBlue flex flex-col items-center justify-center p-8 z-[100]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-brand-orange text-center max-w-sm w-full relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-4 bg-brand-orange/20" />
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-6xl">🏆</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Tuyệt vời!</h2>
                    <p className="text-slate-500 mb-6 font-medium">Bạn đã hoàn thành tất cả từ vựng!</p>
                    <div className="bg-orange-50 rounded-2xl p-4 mb-8">
                        <p className="text-sm text-orange-400 font-bold uppercase tracking-wider mb-1">Tổng điểm</p>
                        <p className="text-5xl font-black text-brand-orange">{score}</p>
                    </div>
                    <button onClick={() => onComplete(score)} className="w-full bg-brand-orange text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:bg-orange-600 transition-transform active:scale-95">
                        Chơi tiếp
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <GameContainer
            title="Smart Monkey"
            score={score}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            onRestart={initGame}
            onExit={onExit}
            hideScore={true}
        >
            <div className="h-full w-full relative overflow-hidden bg-sky-100 font-comic select-none flex flex-col">

                {/* --- GREEN CONVEYOR ROOF --- */}
                <div className="absolute top-0 left-0 w-full h-16 z-20 shadow-lg pointer-events-none">
                    <div className="w-full h-6 bg-green-700" />
                    <div className="w-full h-10 bg-green-600 relative">
                        <div className="absolute -bottom-4 left-0 w-full flex overflow-hidden">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div key={i} className="w-8 h-8 bg-green-600 rounded-full flex-shrink-0 -ml-2 border-b-2 border-green-800/30" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- HEADER INFO --- */}
                <div className="absolute top-24 left-4 z-50">
                    <div className="bg-white/80 backdrop-blur border-2 border-brand-orange rounded-full px-4 py-1.5 shadow-sm flex items-center gap-2">
                        <Clock size={16} className="text-brand-orange" />
                        <span className="font-mono font-bold text-lg text-slate-700">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="absolute top-24 right-4 z-50">
                    <div className="bg-brand-orange text-white rounded-full px-4 py-1.5 shadow-md font-bold text-lg border-2 border-white">
                        {score} pts
                    </div>
                </div>

                {/* --- MOVING BELT --- */}
                <div className="flex-1 w-full relative z-10 pt-16">
                    <div className="w-full h-full relative">
                        {beltWords.length > 0 && (
                            <motion.div
                                className="flex gap-32 pl-32 absolute top-0 left-0 items-start"
                                // Loop Animation: 0 to -TotalDistance
                                // ease: "linear" for constant speed
                                // repeat: Infinity handles the loop
                                animate={{ x: [0, -totalLoopDistance] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: animationDuration,
                                    ease: "linear"
                                }}
                            >
                                {beltWords.map((word) => (
                                    <div key={word.uniqueId} className="relative flex flex-col items-center group flex-shrink-0 pt-0 w-44">
                                        {/* Added w-44 explicitly to wrapper to match math */}

                                        {/* Wooden Connector Bar */}
                                        <div className="w-3 h-20 bg-[#5d4037] relative origin-top shadow-sm border-l border-r border-[#3e2723]">
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full shadow-inner" />
                                        </div>

                                        {/* Sign Board */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => handleSignClick(e, word)}
                                            className={`
                                                relative w-full h-28 bg-[#ffcc80] border-4 border-[#e65100] 
                                                rounded-lg shadow-xl flex flex-col items-center justify-center p-2
                                                hover:brightness-110 transition-all active:translate-y-1 z-10
                                            `}
                                        >
                                            <span className="text-xl font-bold text-[#3e2723] text-center leading-tight break-words drop-shadow-sm line-clamp-2">
                                                {word.word}
                                            </span>

                                            {/* Attached Payload */}
                                            <AnimatePresence>
                                                {word.matchedPayload && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        className="absolute top-full mt-[-2px] z-20 flex flex-col items-center"
                                                    >
                                                        <div className="w-1.5 h-4 bg-[#8d6e63] mb-[-2px] relative z-0 mx-auto" />
                                                        <div className="w-32 h-20 bg-white rounded-lg border-4 border-[#e65100] shadow-md flex items-center justify-center p-1.5 relative z-10 origin-top animate-swing transform hover:scale-110 transition-transform">
                                                            {/* Enhanced Image Fallback */}
                                                            {word.matchedPayload.image.startsWith('http') ? (
                                                                <img
                                                                    src={word.matchedPayload.image}
                                                                    className="w-full h-full object-contain rounded-sm"
                                                                    alt="matched"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        // Show fallback sibling
                                                                        const sibling = e.currentTarget.parentElement?.querySelector('.fallback-text');
                                                                        if (sibling) sibling.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : ( // No URL provided
                                                                <div className="fallback-text w-full h-full flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-slate-800 text-center">{word.matchedPayload.meaning}</span>
                                                                </div>
                                                            )}
                                                            {/* Hidden Fallback for onError */}
                                                            <div className="fallback-text hidden w-full h-full flex items-center justify-center absolute inset-0 bg-white rounded-sm">
                                                                <span className="text-xs font-bold text-slate-800 text-center">{word.matchedPayload.meaning}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* --- MONKEY AREA --- */}
                <div className="w-full flex justify-center pb-0 relative z-40 bg-gradient-to-t from-green-500/20 to-transparent pt-12">
                    <div className="absolute bottom-0 w-full h-12 bg-[#4caf50] border-t-8 border-[#388e3c]" />

                    <div className="relative flex flex-col items-center mb-2">
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -top-32 bg-white px-6 py-3 rounded-2xl shadow-xl border-4 border-red-200 z-50 whitespace-nowrap"
                                >
                                    <span className="font-black text-xl text-red-500">{message.text}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {currentTarget && (
                                <motion.div
                                    key={currentTarget.id}
                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
                                    className="relative z-20 transform -rotate-1 mb-[-40px]"
                                    ref={monkeyBoardRef}
                                >
                                    <div className="w-56 h-40 bg-white rounded-2xl border-[6px] border-slate-700 shadow-2xl flex flex-col items-center justify-center p-3 relative group cursor-pointer hover:scale-105 transition-transform bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 rounded-full border border-slate-300">
                                            FIND THE MATCH
                                        </div>
                                        {currentTarget.image.startsWith('http') ? (
                                            <>
                                                <img
                                                    src={currentTarget.image}
                                                    className="w-full h-full object-contain pointer-events-none"
                                                    alt="target"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement?.querySelector('.fallback-main')?.classList.remove('hidden');
                                                    }}
                                                />
                                                <div className="fallback-main hidden absolute inset-0 flex items-center justify-center p-4">
                                                    <span className="text-3xl text-center font-bold text-slate-800 break-words w-full">{currentTarget.meaning}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-3xl text-center font-bold text-slate-800 break-words w-full px-2">{currentTarget.meaning}</span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <img src={mascotImg} alt="Monkey" className="w-40 md:w-48 object-contain relative z-10 mt-8" />
                    </div>
                </div>

                {/* --- FLYING ANIMATION --- */}
                {flyingPayload && (
                    <motion.div
                        initial={{
                            position: 'fixed',
                            left: flyingPayload.start.x,
                            top: flyingPayload.start.y,
                            scale: 1,
                            zIndex: 100,
                            rotate: -2
                        }}
                        animate={{
                            top: 150,
                            left: window.innerWidth / 2,
                            scale: 0.4,
                            opacity: 0
                        }}
                        transition={{ duration: 0.6, ease: "backIn" }}
                        className="w-56 h-40 bg-white rounded-2xl border-4 border-slate-700 shadow-xl flex items-center justify-center p-2 pointer-events-none"
                    >
                        {flyingPayload.payload.image.startsWith('http') ? (
                            <img src={flyingPayload.payload.image} className="w-full h-full object-contain" alt="flying" />
                        ) : (
                            <span className="text-xl font-bold">{flyingPayload.payload.meaning}</span>
                        )}
                    </motion.div>
                )}
            </div>
        </GameContainer>
    )
}

export default SmartMonkeyGame
