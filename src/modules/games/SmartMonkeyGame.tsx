import React, { useState, useEffect, useRef } from 'react'
import { GameContainer } from './components/GameContainer'
import { Vocabulary } from '@/types'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Clock } from 'lucide-react'
import mascotImg from '@/assets/images/monkey_board.png'
import aiJungleBg from '@/assets/images/smart_monkey_jungle_bg.png'
import { GameReview, ReviewItem } from './components/GameReview'
import { GameResult } from './components/GameResult'

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
    // Speed: pixels per second. Increased from 75 to 130 as requested for a faster challenge.
    const SPEED_PX_PER_SEC = 130

    // Component Refs
    const monkeyBoardRef = useRef<HTMLDivElement>(null)
    const bgMusicRef = useRef<HTMLAudioElement | null>(null)

    // State
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
    const [isPaused, setIsPaused] = useState(false)
    const [gamePhase, setGamePhase] = useState<'playing' | 'review' | 'result'>('playing')
    const [userAnswers, setUserAnswers] = useState<ReviewItem[]>([])

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

    // Mouse tracking for monkey
    const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500)
    const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 15 })
    const monkeyX = useTransform(smoothMouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-80, 80])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX])

    // Background Music
    useEffect(() => {
        // Using the user's requested YouTube track (downloaded as mp4, perfectly playable by new Audio() in browsers)
        bgMusicRef.current = new Audio('/sounds/fun_bg_jungle_user.mp4')
        bgMusicRef.current.loop = true
        bgMusicRef.current.volume = 0.4 // Background level

        const playMusic = () => {
            bgMusicRef.current?.play().catch(e => console.log("Audio autoplay blocked", e))
        }

        // Try to play immediately (might be blocked until interaction)
        playMusic()

        // Cleanup
        return () => {
            bgMusicRef.current?.pause()
            bgMusicRef.current = null
        }
    }, [])

    // Setup
    // Landscape Enforcement State
    const [isLandscape, setIsLandscape] = useState(true)

    // Setup & Orientation Check
    useEffect(() => {
        const checkOrientation = () => {
            const isMobile = window.innerWidth < 768
            const isPortrait = window.innerHeight > window.innerWidth
            // Only enforce landscape if on mobile
            if (isMobile && isPortrait) {
                setIsLandscape(false)
                setIsPaused(true) // Auto-pause game
            } else {
                setIsLandscape(true)
                setIsPaused(false) // Resume (optional, or keep user paused manually)
            }
        }

        checkOrientation()
        window.addEventListener('resize', checkOrientation)
        return () => window.removeEventListener('resize', checkOrientation)
    }, [])

    // ... (keep initGame and Timer same)

    useEffect(() => {
        if (isLandscape) initGame()
    }, [isLandscape])

    useEffect(() => {
        if (isPaused || gamePhase !== 'playing') return
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
    }, [isPaused, gamePhase])

    const initGame = () => {
        if (!data?.words || data.words.length === 0) return

        // 1. Prepare Target Queue (The words the user needs to find)
        // Shuffle completely
        const shuffledTargets = [...data.words].sort(() => Math.random() - 0.5)
        setTargetQueue(shuffledTargets.slice(1))
        setCurrentTarget(shuffledTargets[0])

        // 2. Prepare Belt Items (Infinite Loop Illusion)
        let pool = [...data.words]
        while (pool.length < 10) {
            pool = [...pool, ...data.words]
        }
        const beltShuffled = [...pool].sort(() => Math.random() - 0.5)

        // Setup for seamless loop: List A + List A.
        const loopList = [...beltShuffled, ...beltShuffled].map((w, i) => ({
            ...w,
            uniqueId: `belt-${i}-${Math.random().toString(36).substr(2, 9)}`
        }))

        setBeltWords(loopList)
        setScore(0)
        setTimeLeft(ROUND_DURATION)
        setGamePhase('playing')
        setUserAnswers([])

        // Resume music if it was paused or not started
        bgMusicRef.current?.play().catch(() => { })
    }

    const endGame = () => {
        setGamePhase('review')
        bgMusicRef.current?.pause()
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
        if (isPaused || gamePhase !== 'playing' || !currentTarget || flyingPayload) return

        if (beltWord.id === currentTarget.id) {
            // Correct Match
            playSound('correct')
            setScore(prev => prev + 10)

            setUserAnswers(prev => [...prev, {
                question: `Tìm từ cho: "${currentTarget.meaning}"`,
                userAnswer: beltWord.word,
                correctAnswer: currentTarget.word,
                isCorrect: true
            }])

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
                // FIXED: Update matched status for ALL instances of this word on the belt (original + clone)
                // This prevents the "disappearing match" bug when the infinite loop resets.
                setBeltWords(prev => prev.map(w =>
                    w.id === beltWord.id
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

            setUserAnswers(prev => [...prev, {
                question: `Tìm từ cho: "${currentTarget.meaning}"`,
                userAnswer: beltWord.word,
                correctAnswer: currentTarget.word,
                isCorrect: false
            }])

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

    // --- RENDER: LANDSCAPE WARNING ---
    if (!isLandscape) {
        return (
            <div className="fixed inset-0 bg-brand-blue z-[100] flex flex-col items-center justify-center text-white p-8 text-center">
                <div className="w-24 h-24 mb-6 border-4 border-white rounded-2xl animate-spin-slow flex items-center justify-center">
                    <div className="w-16 h-24 border-2 border-white rounded-lg animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Vui lòng xoay ngang điện thoại</h2>
                <p>Trò chơi này cần màn hình rộng để hiển thị tốt nhất!</p>
            </div>
        )
    }

    if (gamePhase === 'review') {
        return <GameReview items={userAnswers} onContinue={() => setGamePhase('result')} />
    }

    if (gamePhase === 'result') {
        const totalWords = data.words?.length || 0
        return <GameResult score={score} maxScore={totalWords * 10} onComplete={() => onComplete(score)} />
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
            <div className="h-full w-full relative overflow-hidden font-comic select-none flex flex-col">
                {/* --- LUSH JUNGLE AI BACKGROUND IMAGE WITH BREATHING ANIMATION --- */}
                <motion.div
                    animate={{ scale: [1.02, 1.05, 1.02], rotate: [-0.5, 0.5, -0.5] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform-gpu origin-center"
                    style={{ backgroundImage: `url(${aiJungleBg})` }}
                />
                {/* Vignette effect */}
                <div className="absolute inset-0 bg-green-900/10 mix-blend-overlay z-0 pointer-events-none" />

                {/* --- GREEN CONVEYOR ROOF WITH VINES --- */}
                <div className="absolute top-0 left-0 w-full h-16 z-20 shadow-lg pointer-events-none">
                    <div className="w-full h-6 bg-green-800" />
                    <div className="w-full h-10 bg-green-700 relative">
                        <div className="absolute -bottom-4 left-0 w-[200vw] flex overflow-hidden">
                            {Array.from({ length: 150 }).map((_, i) => (
                                <div key={i} className="w-8 h-8 bg-green-700 rounded-full flex-shrink-0 -ml-2 border-b-2 border-green-900/40" />
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
                                                            {word.matchedPayload.image ? (
                                                                <img
                                                                    src={word.matchedPayload.image}
                                                                    className="w-full h-full object-contain rounded-sm bg-white"
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

                        {/* NEW MASCOT AREA WITH EMBEDDED BOARD */}
                        <motion.div
                            className="relative w-96 md:w-[32rem] h-auto mb-4"
                            style={{ x: monkeyX }}
                            whileHover={{ scale: 1.02 }}
                            ref={monkeyBoardRef}
                        >
                            <img
                                src={mascotImg}
                                alt="Monkey"
                                className="w-full h-full object-contain relative z-10 pointer-events-none"
                            />

                            {/* TARGET CONTENT OVERLAY ON THE WHITEBOARD */}
                            <AnimatePresence>
                                {currentTarget && (
                                    <motion.div
                                        key={currentTarget.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                        className="absolute inset-0 z-20 pointer-events-none"
                                        // Boundaries precisely aligned to the inner white board
                                        style={{ top: '39%', left: '26%', right: '23%', bottom: '26%' }}
                                    >
                                        <div className="absolute inset-x-2 top-1 bottom-3 flex items-center justify-center overflow-hidden">
                                            {currentTarget.image ? (
                                                <>
                                                    <img
                                                        src={currentTarget.image}
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                        alt="target"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const sibling = e.currentTarget.parentElement?.querySelector('.fallback-target');
                                                            if (sibling) sibling.classList.remove('hidden');
                                                        }}
                                                    />
                                                    {/* Fallback container with flex centering */}
                                                    <div className="fallback-target hidden absolute inset-0 w-full h-full flex items-center justify-center p-4">
                                                        <span className="text-2xl md:text-3xl font-black text-slate-800 break-words drop-shadow-sm leading-tight text-center w-full">
                                                            {currentTarget.meaning}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-4">
                                                    <span className="text-2xl md:text-3xl font-black text-slate-800 break-words drop-shadow-sm leading-tight text-center w-full">
                                                        {currentTarget.meaning}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
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
                        {flyingPayload.payload.image ? (
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
